from __future__ import annotations

from typing import List
from datetime import datetime

from app.core.config import settings
from app.db.arango import get_db, has_collection
from app.models.inventory import (
    InventoryItem,
    InventorySummary,
    InventoryListResponse,
    InventoryDetails,
    InventoryDetailsResponse,
)


class InventoryService:
    def __init__(self) -> None:
        self.collection = settings.arango_inventory_collection
        self.fix_collection = settings.arango_fix_collection

    def list(self) -> InventoryListResponse:
        """Return inventory list using Arango if configured.

        If the 'fix' collection exists, executes the pre-aggregation AQL the user provided
        to compute EC2/EBS protection and a unified table. Otherwise, falls back to the
        simple mock response.
        """
        db = get_db()
        try:
            if db is not None and has_collection(self.fix_collection):
                aql = f"""
                /* -------------------- 1) Pre-aggregate snapshots by volume -------------------- */
                LET snapAgg = (
                  FOR s IN {self.fix_collection}
                    FILTER 'aws_ec2_snapshot' IN s.kinds
                    COLLECT volId = s.reported.volume_id INTO grp
                    LET times = grp[*].s.reported.created_at
                    RETURN {{
                      volId,
                      count: LENGTH(grp),
                      last: MAX(times)
                    }}
                )

                LET snapByVol = MERGE(
                  FOR x IN snapAgg
                    RETURN {{ [x.volId]: {{ count: x.count, last: x.last }} }}
                )

                /* -------------------- 2) Volume rows (EBS) -------------------- */
                LET volumeRows = (
                  FOR v IN {self.fix_collection}
                    FILTER 'aws_ec2_volume' IN v.kinds

                    LET volId = v.reported.id
                    LET az = v.reported.availability_zone
                    LET region = az ? SUBSTRING(az, 0, LENGTH(az) - 1) : null

                    LET snap = snapByVol[volId]
                    LET hasSnap = snap && snap.count > 0

                    RETURN {{
                      kind: "EBS",
                      resourceId: volId,
                      name: (v.reported.tags && v.reported.tags.Name) ? v.reported.tags.Name : volId,
                      region: region,
                      status: hasSnap ? "protected" : "unprotected",
                      last_backup: snap ? snap.last : null,
                      details: {{ snapshot_count: snap ? snap.count : 0 }}
                    }}
                )

                /* -------------------- 3) Instance rows -------------------- */
                LET instanceRows = (
                  FOR v IN {self.fix_collection}
                    FILTER 'aws_ec2_volume' IN v.kinds

                    FOR att IN v.reported.volume_attachments
                      COLLECT instanceId = att.instance_id INTO grp = {{ volId: v.reported.id, az: v.reported.availability_zone }}

                      LET perVol = (
                        FOR g IN grp
                          LET snap = snapByVol[g.volId]
                          RETURN {{ volumeId: g.volId, hasSnap: snap && snap.count > 0, last: snap ? snap.last : null }}
                      )

                      LET hasAny = LENGTH(FOR x IN perVol FILTER x.hasSnap RETURN 1) > 0
                      LET lastBackup = MAX(perVol[*].last)

                      LET anyAZ = FIRST(grp).az
                      LET region = anyAZ ? SUBSTRING(anyAZ, 0, LENGTH(anyAZ) - 1) : null

                      RETURN {{
                        kind: "EC2",
                        resourceId: instanceId,
                        name: instanceId,
                        region: region,
                        status: hasAny ? "protected" : "unprotected",
                        last_backup: lastBackup,
                        details: {{ volumes: perVol }}
                      }}
                )

                LET table = APPEND(instanceRows, volumeRows)

                RETURN {{
                  total: LENGTH(table),
                  protected: LENGTH(FOR r IN table FILTER r.status == "protected" RETURN 1),
                  unprotected: LENGTH(FOR r IN table FILTER r.status == "unprotected" RETURN 1),
                  table: table
                }}
                """
                cur = db.aql.execute(aql)
                result = list(cur)
                payload = result[0] if result else {"total": 0, "protected": 0, "unprotected": 0, "table": []}
                rows = payload.get("table", [])

                def type_from_kind(k: str) -> str:
                    if k == "EC2":
                        return "EC2 Instance"
                    if k == "EBS":
                        return "EBS Volume"
                    return k

                items = [
                    InventoryItem(
                        id=str(r.get("resourceId", "")),
                        name=str(r.get("name") or r.get("resourceId", "")),
                        type=type_from_kind(str(r.get("kind", "unknown"))),
                        service=str(r.get("kind", "unknown")),
                        status=str(r.get("status", "unprotected")),
                        region=r.get("region"),
                        last_backup=r.get("last_backup") or None,
                        tags={},
                    )
                    for r in rows
                ]

                total = int(payload.get("total", len(items)))
                protected = int(payload.get("protected", sum(1 for i in items if i.status == "protected")))
                coverage = (protected / total) if total else 0.0
                return InventoryListResponse(
                    summary=InventorySummary(assets=total, coverage=coverage),
                    items=items,
                )
        except Exception:
            # fall back to mock if AQL fails
            pass

        # Fallback mock
        items = [
            InventoryItem(id="i-1", name="web-1", type="EC2 Instance", service="EC2", status="protected", region="us-east-1"),
            InventoryItem(id="vol-2", name="data-vol", type="EBS Volume", service="EBS", status="unprotected", region="us-west-2"),
        ]
        return InventoryListResponse(
            mock=True,
            summary=InventorySummary(assets=len(items), coverage=0.5),
            items=items,
        )

    def details(self) -> InventoryDetailsResponse:
        db = get_db()
        if db is None or not has_collection(self.collection):
            # Fallback mock
            details = [
                InventoryDetails(
                    id="i-1",
                    description="Web server VM",
                    configuration={"cpu": 4, "memory_gb": 8, "os": "ubuntu"},
                    metrics={"uptime_days": 23, "cpu_pct": 12.5},
                ),
                InventoryDetails(
                    id="i-2",
                    description="Primary database",
                    configuration={"engine": "postgres", "version": "15"},
                    metrics={"uptime_days": 30, "qps": 512},
                ),
            ]
            return InventoryDetailsResponse(mock=True, details=details)

        # Query details (example assumes details embedded or separate view)
        cursor = db.aql.execute(
            f"""
            FOR d IN {self.collection}
                RETURN {{
                  id: TO_STRING(d._key),
                  description: d.description,
                  configuration: d.configuration || {{}},
                  metrics: d.metrics || {{}}
                }}
            """
        )
        details = [InventoryDetails(**doc) for doc in cursor]
        return InventoryDetailsResponse(details=details)
