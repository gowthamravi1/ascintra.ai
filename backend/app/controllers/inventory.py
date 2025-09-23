from fastapi import APIRouter

from app.services.inventory_service import InventoryService
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.db.session import get_session
from app.orm.models import AssetsInventory
from app.db.arango import get_db
from datetime import datetime


router = APIRouter(prefix="/api", tags=["inventory"])


@router.get("/tenant/inventory")
@router.get("/inventory")
def get_inventory_list():
    svc = InventoryService()
    # Use persisted assets inventory for responses
    return svc.list_persisted()


@router.get("/tenant/inventory/details")
@router.get("/inventory/details")
def get_inventory_details():
    svc = InventoryService()
    return svc.details()


@router.get("/tenant/inventory/coverage")
def get_inventory_coverage():
    """Aggregate coverage by service and region from Postgres assets_inventory."""
    session: Session = get_session()
    try:
        rows = session.execute(
            select(AssetsInventory.service, AssetsInventory.region, AssetsInventory.status, func.count())
            .group_by(AssetsInventory.service, AssetsInventory.region, AssetsInventory.status)
        ).all()
        by_service = {}
        by_region = {}
        total = 0
        prot = 0
        unprot = 0
        partial = 0
        for svc, region, status, cnt in rows:
            c = int(cnt)
            total += c
            s = (status or "").lower()
            if s == "protected":
                prot += c
            elif s == "partial":
                partial += c
            else:
                unprot += c

            key = (svc or "unknown").upper() if svc else "UNKNOWN"
            d = by_service.setdefault(key, {"service": key, "total": 0, "protected": 0, "partial": 0, "unprotected": 0})
            d["total"] += c
            if s == "protected":
                d["protected"] += c
            elif s == "partial":
                d["partial"] += c
            else:
                d["unprotected"] += c

            rk = region or "unknown"
            rr = by_region.setdefault(rk, {"region": rk, "total": 0, "protected": 0, "partial": 0, "unprotected": 0})
            rr["total"] += c
            if s == "protected":
                rr["protected"] += c
            elif s == "partial":
                rr["partial"] += c
            else:
                rr["unprotected"] += c

        for d in by_service.values():
            d["coverage"] = round((d["protected"] / d["total"] * 100.0), 1) if d["total"] else 0.0
        for rr in by_region.values():
            rr["coverage"] = round((rr["protected"] / rr["total"] * 100.0), 1) if rr["total"] else 0.0

        distribution = {
            "protected": prot,
            "partial": partial,
            "unprotected": unprot,
        }
        coverage_pct = round((prot / total * 100.0), 1) if total else 0.0

        # Lightweight items list for tables with additional fields for frontend
        items_rows = session.execute(
            select(
                AssetsInventory.resource_id,
                AssetsInventory.name,
                AssetsInventory.type,
                AssetsInventory.service,
                AssetsInventory.region,
                AssetsInventory.status,
                AssetsInventory.last_backup,
            ).limit(500)
        ).all()
        items = [
            {
                "id": r.resource_id,
                "name": r.name,
                "type": r.type,
                "service": (r.service or "unknown").upper(),
                "region": r.region,
                "status": r.status,
                "last_backup": (r.last_backup.isoformat() if r.last_backup else None),
                # Additional fields for frontend compatibility
                "nextBackup": "N/A",  # Placeholder - would need backup schedule data
                "rto": "N/A",  # Placeholder - would need RTO/RPO data
                "rpo": "N/A",  # Placeholder - would need RTO/RPO data
                "policy": "None",  # Placeholder - would need backup policy data
                "cost": "$0.00",  # Placeholder - would need cost data
            }
            for r in items_rows
        ]

        return {
            "summary": {
                "total": total,
                "protected": prot,
                "partial": partial,
                "unprotected": unprot,
                "coverage": coverage_pct,
            },
            "by_service": sorted(by_service.values(), key=lambda x: x["service"]),
            "by_region": sorted(by_region.values(), key=lambda x: x["region"]),
            "items": items,
            "distribution": distribution,
        }
    finally:
        session.close()


@router.get("/tenant/inventory/details/{resource_id}")
def get_inventory_item_details(resource_id: str):
    """Return details for a single asset from Postgres, enriched by Arango if arango_id is present."""
    session: Session = get_session()
    try:
        row = (
            session.query(AssetsInventory)
            .filter(AssetsInventory.resource_id == resource_id)
            .one_or_none()
        )
        if not row:
            return {"ok": False, "error": "not_found"}

        data = {
            "id": row.resource_id,
            "name": row.name,
            "type": row.type,
            "service": (row.service or "unknown").upper(),
            "region": row.region,
            "status": row.status,
            "last_backup": (row.last_backup.isoformat() if row.last_backup else None),
            "account_id": str(row.account_id),
            "arango_id": row.arango_id,
            "tags": row.tags or {},
        }

        # Try to enrich from Arango with configuration + metadata
        def _safe_get(d: dict, *keys, default=None):
            cur = d
            for k in keys:
                if not isinstance(cur, dict) or k not in cur:
                    return default
                cur = cur[k]
            return cur

        config = {}
        meta = {"tags": data.get("tags") or {}}

        if row.arango_id:
            db = get_db()
            if db is not None:
                try:
                    coll, key = str(row.arango_id).split("/", 1)
                    doc = db.collection(coll).get(key)
                    if doc:
                        reported = doc.get("reported") or {}
                        kinds = doc.get("kinds") or []

                        svc = (row.service or "").lower()
                        # EC2 instance
                        if svc == "ec2" or any("aws_ec2_instance" in k for k in kinds):
                            config = {
                                "instanceType": reported.get("instance_type"),
                                "ami": reported.get("image_id") or reported.get("ami"),
                                "keyPair": reported.get("key_name"),
                                "vpc": reported.get("vpc_id"),
                                "subnet": reported.get("subnet_id"),
                                "iamRole": _safe_get(reported, "iam_instance_profile", "arn"),
                                "monitoring": _safe_get(reported, "monitoring", "state"),
                                "detailedMonitoring": _safe_get(reported, "monitoring", "state"),
                                "ebsOptimized": reported.get("ebs_optimized"),
                                "publicIp": reported.get("public_ip_address"),
                                "privateIp": reported.get("private_ip_address"),
                                "securityGroups": [
                                    g.get("group_id") or g.get("group_name") or str(g)
                                    for g in (reported.get("security_groups") or [])
                                ],
                            }
                            created = reported.get("launch_time") or reported.get("launched_at")
                            if created:
                                meta["created"] = created

                        # EBS volume
                        elif svc == "ebs" or any("aws_ec2_volume" in k for k in kinds):
                            config = {
                                "volumeType": reported.get("volume_type"),
                                "sizeGiB": reported.get("size"),
                                "iops": reported.get("iops"),
                                "throughput": reported.get("throughput"),
                                "availabilityZone": reported.get("availability_zone"),
                                "encrypted": reported.get("encrypted"),
                                "multiAttach": reported.get("multi_attach_enabled"),
                            }
                            meta["created"] = reported.get("create_time")

                        # S3 bucket
                        elif svc == "s3" or any("aws_s3_bucket" in k for k in kinds):
                            versioning = _safe_get(reported, "versioning", "status") or _safe_get(reported, "versioning", "Status")
                            config = {
                                "versioning": versioning,
                                "replication": bool(reported.get("replication_configuration")),
                                "bucketPolicy": True if reported.get("policy") else False,
                            }
                            meta["created"] = reported.get("creation_date")

                        # RDS instance
                        elif svc == "rds" or any("aws_rds_db_instance" in k for k in kinds):
                            config = {
                                "engine": reported.get("engine"),
                                "engineVersion": reported.get("engine_version"),
                                "instanceClass": reported.get("db_instance_class"),
                                "multiAZ": reported.get("multi_az"),
                                "backupRetentionDays": reported.get("backup_retention_period"),
                                "storageType": reported.get("storage_type"),
                            }
                            meta["created"] = reported.get("instance_create_time")

                        # Generic fallback
                        else:
                            # Include a flattened subset of top-level scalar fields
                            for k, v in reported.items():
                                if isinstance(v, (str, int, float, bool)):
                                    config[k] = v

                        # Tags from reported if present
                        rep_tags = reported.get("tags")
                        if isinstance(rep_tags, dict):
                            meta["tags"] = rep_tags
                        elif isinstance(rep_tags, list):
                            # Convert list of {Key,Value} or {key,value}
                            tag_map = {}
                            for t in rep_tags:
                                if isinstance(t, dict):
                                    k = t.get("Key") or t.get("key")
                                    val = t.get("Value") or t.get("value")
                                    if k is not None:
                                        tag_map[str(k)] = str(val) if val is not None else ""
                            if tag_map:
                                meta["tags"] = tag_map
                except Exception:
                    pass

        data["configuration"] = config
        data["metadata"] = meta

        return {"ok": True, "item": data}
    finally:
        session.close()
