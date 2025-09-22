from __future__ import annotations

from typing import List
from datetime import datetime

from app.core.config import settings
from app.db.arango import get_db, has_collection
from sqlalchemy import select, delete
from sqlalchemy.orm import Session
from app.db.session import get_session
from app.orm.models import AssetsInventory, CloudAccount
from dateutil import parser as dateparser
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

    def materialize_assets_from_fix(self, account_identifier: str | None = None) -> dict:
        """Scan the entire `fix` inventory and upsert normalized assets into Postgres `assets_inventory`.

        - Includes ALL resource types discovered in `fix` (not just EC2/EBS/S3/RDS).
        - Applies heuristics for protection status when possible (EBS snapshots, EC2 via attached volumes,
          S3 versioning/replication, RDS retention). Other types default to "unprotected" until rules are added.
        - Persists each asset with an `account_id` field so that per-account views and rescans are supported.

        Returns aggregate totals: { total, protected, unprotected } for the provided account if specified,
        otherwise for the whole dataset.
        """
        db = get_db()
        if db is None:
            # No Arango source configured
            return {"total": 0, "protected": 0, "unprotected": 0}
        try:
            # Generic materialization plan
            # - Build protection hints for known services (EBS/EC2/S3/RDS) as before.
            # - Gather ALL resources from fix with their derived service/type/id/name/region.
            # - If a resource has a matching protection hint, use it; else default to "unprotected".

            aql = f"""
            /* 1) Snapshot aggregation by EBS volume */
            LET snapAgg = (
              FOR s IN {self.fix_collection}
                FILTER 'aws_ec2_snapshot' IN s.kinds
                COLLECT volId = s.reported.volume_id INTO grp
                LET times = grp[*].s.reported.created_at
                RETURN {{ volId, count: LENGTH(grp), last: MAX(times) }}
            )
            LET snapByVol = MERGE(FOR x IN snapAgg RETURN {{ [x.volId]: {{ count: x.count, last: x.last }} }})

            /* 2) EBS Volume protection rows */
            LET volumeRows = (
              FOR v IN {self.fix_collection}
                FILTER 'aws_ec2_volume' IN v.kinds
                LET volId = v.reported.id
                LET az = v.reported.availability_zone
                LET region = az ? SUBSTRING(az, 0, LENGTH(az) - 1) : (v.reported.region || null)
                LET snap = snapByVol[volId]
                LET hasSnap = snap && snap.count > 0
                RETURN {
                  provider: 'aws',
                  service: 'ebs',
                  kind: 'aws_ec2_volume',
                  resourceId: volId,
                  name: (v.reported.tags && v.reported.tags.Name) ? v.reported.tags.Name : volId,
                  region: region,
                  status: hasSnap ? 'protected' : 'unprotected',
                  last_backup: snap ? snap.last : null
                }
            )

            /* 3) EC2 Instance rows via attached volumes */
            LET instanceRows = (
              FOR v IN {self.fix_collection}
                FILTER 'aws_ec2_volume' IN v.kinds
                FOR att IN v.reported.volume_attachments
                  COLLECT instanceId = att.instance_id, meta = {{ volId: v.reported.id, az: v.reported.availability_zone }} INTO grp
                  LET perVol = (
                    FOR g IN grp
                      LET snap = snapByVol[g.meta.volId]
                      RETURN { volId: g.meta.volId, hasSnap: snap && snap.count > 0, last: snap ? snap.last : null }
                  )
                  LET hasAny = LENGTH(FOR x IN perVol FILTER x.hasSnap RETURN 1) > 0
                  LET lastBackup = MAX(perVol[*].last)
                  LET anyAZ = FIRST(grp).meta.az
                  LET region = anyAZ ? SUBSTRING(anyAZ, 0, LENGTH(anyAZ) - 1) : null
                  LET instanceDoc = FIRST(FOR i IN {self.fix_collection} FILTER 'aws_ec2_instance' IN i.kinds AND (i.reported.id == instanceId OR i.reported.instance_id == instanceId) RETURN i)
                  RETURN {
                    provider: 'aws',
                    service: 'ec2',
                    kind: 'aws_ec2_instance',
                    resourceId: instanceId,
                    name: instanceId,
                    region: region,
                    status: hasAny ? 'protected' : 'unprotected',
                    last_backup: lastBackup,
                    sourceId: instanceDoc ? TO_STRING(instanceDoc._id) : null
                  }
            )

            /* 4) S3 bucket rows */
            LET s3Rows = (
              FOR b IN {self.fix_collection}
                FILTER 'aws_s3_bucket' IN b.kinds
                LET name = b.reported.name || b.reported.bucket || b.reported.id
                LET versioning = b.reported.versioning && (b.reported.versioning.status || b.reported.versioning.Status)
                LET hasVersioning = versioning == 'Enabled' || versioning == true
                LET hasReplication = b.reported.replication_configuration != null
                LET region = b.reported.region
                RETURN {
                  provider: 'aws',
                  service: 's3',
                  kind: 'aws_s3_bucket',
                  resourceId: name,
                  name: name,
                  region: region,
                  status: (hasVersioning || hasReplication) ? 'protected' : 'unprotected',
                  last_backup: null,
                  sourceId: TO_STRING(b._id)
                }
            )

            /* 5) RDS instance rows */
            LET rdsRows = (
              FOR r IN {self.fix_collection}
                FILTER 'aws_rds_db_instance' IN r.kinds
                LET id = r.reported.db_instance_identifier || r.reported.id
                LET az = r.reported.availability_zone
                LET region = az ? SUBSTRING(az, 0, LENGTH(az) - 1) : (r.reported.region || null)
                LET retention = TO_NUMBER(r.reported.backup_retention_period)
                LET hasBackups = retention != null && retention > 0
                RETURN {
                  provider: 'aws',
                  service: 'rds',
                  kind: 'aws_rds_db_instance',
                  resourceId: id,
                  name: id,
                  region: region,
                  status: hasBackups ? 'protected' : 'unprotected',
                  last_backup: null,
                  sourceId: TO_STRING(r._id)
                }
            )

            /* 6) Build a map of known rows for dedup */
            LET known = APPEND(APPEND(APPEND(volumeRows, instanceRows), s3Rows), rdsRows)
            LET knownKeys = MERGE(FOR x IN known RETURN { [CONCAT(x.kind, ':', x.resourceId)]: true })

            /* 7) Fallback rows: include ALL other resources (all kinds), default unprotected */
            LET allRows = (
              FOR v IN {self.fix_collection}
                LET k = FIRST(FOR kk IN v.kinds FILTER LIKE(kk, '%_%', true) RETURN kk)
                FILTER k != null
                LET isAws = LIKE(k, 'aws_%', true)
                LET provider = isAws ? 'aws' : 'unknown'
                LET svcStart = POSITION(k, '_', 4)
                LET svc = svcStart ? SUBSTRING(k, 4, svcStart - 4) : k
                LET resourceId = v.reported.id || v.reported.arn || TO_STRING(v._key)
                LET name = v.reported.name || (v.reported.tags && v.reported.tags.Name) || v.reported.bucket || v.reported.db_instance_identifier || resourceId
                LET az = v.reported.availability_zone
                LET region = v.reported.region || (az ? SUBSTRING(az, 0, LENGTH(az) - 1) : null)
                LET key = CONCAT(k, ':', resourceId)
                FILTER knownKeys[key] == null
                RETURN {
                  provider: provider,
                  service: svc,
                  kind: k,
                  resourceId: resourceId,
                  name: name,
                  region: region,
                  status: 'unprotected',
                  last_backup: null,
                  sourceId: TO_STRING(v._id)
                }
            )

            /* 8) Union everything */
            LET table = APPEND(known, allRows)

            RETURN {
              total: LENGTH(table),
              protected: LENGTH(FOR r IN table FILTER r.status == 'protected' RETURN 1),
              unprotected: LENGTH(FOR r IN table FILTER r.status == 'unprotected' RETURN 1),
              table: table
            }
            """

            cur = db.aql.execute(aql)
            result = list(cur)
            payload = result[0] if result else {"total": 0, "protected": 0, "unprotected": 0, "table": []}
            rows = payload.get("table", [])

            # Persist to Postgres assets_inventory
            session: Session = get_session()
            try:
                # Resolve account UUID (force assign all scanned resources to this account)
                acct_id = None
                if account_identifier:
                    acct = (
                        session.query(CloudAccount)
                        .filter(CloudAccount.account_identifier == account_identifier)
                        .one_or_none()
                    )
                    acct_id = acct.id if acct else None

                # Clean existing assets for this account (if specified)
                if acct_id is not None:
                    session.execute(
                        delete(AssetsInventory).where(AssetsInventory.account_id == acct_id)
                    )
                    session.commit()

                total = 0
                protected = 0

                for r in rows:
                    kind = str(r.get("kind", "unknown"))
                    rid = str(r.get("resourceId", ""))
                    provider = str(r.get("provider", "aws"))
                    svc = str(r.get("service", "unknown"))
                    type_label = kind
                    try:
                        if kind.startswith("aws_"):
                            rest = kind[4:]
                            if "_" in rest:
                                _, type_part = rest.split("_", 1)
                                type_label = f"{svc.upper()} " + type_part.replace("_", " ").title()
                            else:
                                type_label = f"{svc.upper()} {rest.replace('_', ' ').title()}"
                    except Exception:
                        pass

                    last_backup_raw = r.get("last_backup")
                    last_backup_dt = None
                    if last_backup_raw:
                        try:
                            last_backup_dt = dateparser.parse(str(last_backup_raw))
                        except Exception:
                            last_backup_dt = None

                    # Assign ALL rows to the provided account id (fix does not include account id reliably)
                    row_account_uuid = acct_id
                    if row_account_uuid is None:
                        # Skip rows we cannot associate to an account
                        continue

                    # Upsert: try to find existing
                    existing = (
                        session.query(AssetsInventory)
                        .filter(
                            AssetsInventory.account_id == row_account_uuid,
                            AssetsInventory.service == svc,
                            AssetsInventory.kind == kind,
                            AssetsInventory.resource_id == rid,
                        )
                        .one_or_none()
                    )
                    if existing:
                        existing.provider = provider
                        existing.name = r.get("name") or rid
                        existing.type = type_label
                        existing.status = str(r.get("status", "unprotected"))
                        existing.region = r.get("region")
                        existing.last_backup = last_backup_dt
                        existing.tags = {}
                        existing.arango_id = r.get("sourceId")
                    else:
                        row = AssetsInventory(
                            account_id=row_account_uuid,
                            provider=provider,
                            service=svc,
                            kind=kind,
                            resource_id=rid,
                            name=r.get("name") or rid,
                            type=type_label,
                            status=str(r.get("status", "unprotected")),
                            region=r.get("region"),
                            last_backup=last_backup_dt,
                            tags={},
                            arango_id=r.get("sourceId"),
                        )
                        session.add(row)

                    total += 1
                    if str(r.get("status", "unprotected")) == "protected":
                        protected += 1

                session.commit()
                return {"total": int(total), "protected": int(protected), "unprotected": int(total - protected)}
            finally:
                session.close()
        except Exception:
            return {"total": 0, "protected": 0, "unprotected": 0}

    def list_persisted(self) -> InventoryListResponse:
        return self.list()

    def list(self) -> InventoryListResponse:
        """Return assets from Postgres assets_inventory table."""
        session: Session = get_session()
        try:
            rows = session.execute(
                select(
                    AssetsInventory.resource_id,
                    AssetsInventory.name,
                    AssetsInventory.type,
                    AssetsInventory.service,
                    AssetsInventory.status,
                    AssetsInventory.region,
                    AssetsInventory.last_backup,
                    AssetsInventory.tags,
                    AssetsInventory.account_id,
                )
            ).all()

            def norm_service(val: str) -> str:
                v = (val or "unknown").lower()
                mapping = {"ec2": "EC2", "rds": "RDS", "ebs": "EBS", "s3": "S3", "lambda": "Lambda"}
                return mapping.get(v, v.capitalize())

            items = [
                InventoryItem(
                    id=str(r.resource_id or ""),
                    name=str(r.name or r.resource_id or ""),
                    type=str(r.type or "unknown"),
                    service=norm_service(str(r.service or "unknown")),
                    status=str(r.status or "unprotected"),
                    region=r.region,
                    last_backup=(r.last_backup.isoformat() if r.last_backup else None),
                    tags=r.tags or {},
                    account_id=(str(r.account_id) if r.account_id else None),
                )
                for r in rows
            ]
            total = len(items)
            protected = sum(1 for i in items if i.status == "protected")
            coverage = (protected / total) if total else 0.0
            return InventoryListResponse(summary=InventorySummary(assets=total, coverage=coverage), items=items)
        finally:
            session.close()

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

                /* -------------------- 4) S3 bucket rows -------------------- */
                LET s3Rows = (
                  FOR b IN {self.fix_collection}
                    FILTER 'aws_s3_bucket' IN b.kinds
                    LET name = b.reported.name || b.reported.bucket || b.reported.id
                    LET versioning = b.reported.versioning && (b.reported.versioning.status || b.reported.versioning.Status)
                    LET hasVersioning = versioning == 'Enabled' || versioning == true
                    LET hasReplication = b.reported.replication_configuration != null
                    LET region = b.reported.region
                    RETURN {{
                      kind: "S3",
                      resourceId: name,
                      name: name,
                      region: region,
                      status: (hasVersioning || hasReplication) ? "protected" : "unprotected",
                      last_backup: null,
                      details: {{ versioning: hasVersioning, replication: hasReplication }}
                    }}
                )

                /* -------------------- 5) RDS instance rows -------------------- */
                LET rdsRows = (
                  FOR r IN {self.fix_collection}
                    FILTER 'aws_rds_db_instance' IN r.kinds
                    LET id = r.reported.db_instance_identifier || r.reported.id
                    LET az = r.reported.availability_zone
                    LET region = az ? SUBSTRING(az, 0, LENGTH(az) - 1) : (r.reported.region || null)
                    LET retention = TO_NUMBER(r.reported.backup_retention_period)
                    LET hasBackups = retention != null && retention > 0
                    RETURN {{
                      kind: "RDS",
                      resourceId: id,
                      name: id,
                      region: region,
                      status: hasBackups ? "protected" : "unprotected",
                      last_backup: null,
                      details: {{ retention: retention }}
                    }}
                )

                LET table12 = APPEND(instanceRows, volumeRows)
                LET table123 = APPEND(table12, s3Rows)
                LET table = APPEND(table123, rdsRows)

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
                    if k == "S3":
                        return "S3 Bucket"
                    if k == "RDS":
                        return "RDS Instance"
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
        # Build minimal details from assets_inventory (no deep config yet)
        session: Session = get_session()
        try:
            rows = session.execute(
                select(
                    AssetsInventory.resource_id,
                    AssetsInventory.name,
                    AssetsInventory.service,
                    AssetsInventory.region,
                    AssetsInventory.status,
                    AssetsInventory.last_backup,
                )
            ).all()
            details = [
                InventoryDetails(
                    id=str(r.resource_id or ""),
                    description=f"{r.service} resource in {r.region or 'unknown'} ({r.status})",
                    configuration={},
                    metrics={"last_backup": (r.last_backup.isoformat() if r.last_backup else None)},
                )
                for r in rows
            ]
            return InventoryDetailsResponse(details=details)
        finally:
            session.close()
