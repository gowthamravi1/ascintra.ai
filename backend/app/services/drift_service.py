from __future__ import annotations

from typing import Any, Dict, List
from datetime import datetime, timezone

from app.core.config import settings
from app.db.arango import get_db, has_collection


def _first_non_empty(*vals):
    for v in vals:
        if v is not None and v != "":
            return v
    return None


class DriftService:
    def overview(self, limit: int = 200) -> Dict[str, Any]:
        db = get_db()
        if db is None or not has_collection(settings.arango_fix_collection):
            return {
                "summary": {
                    "totalResources": 0,
                    "driftingResources": 0,
                    "criticalDrift": 0,
                    "mediumDrift": 0,
                    "lowDrift": 0,
                    "lastScan": datetime.now(timezone.utc).isoformat(),
                    "nextScan": None,
                },
                "items": [],
            }
        history_coll = settings.arango_fix_history_collection or "fix_node_history"

        # Build AQL to fetch current + earliest historical reported payload
        hist_segment = ""
        if has_collection(history_coll):
            hist_segment = f"""
            LET earliest = FIRST(
              FOR h IN {history_coll}
                FILTER h._key == c._key
                LET t = DATE_TIMESTAMP(
                  h.reported.updated_at || h.reported.create_time || h.reported.creation_date || h.created_at || h.updated_at || null
                )
                SORT t ASC NULLS LAST
                LIMIT 1
                RETURN h
            )
            """
        else:
            hist_segment = "LET earliest = null"

        aql = f"""
        FOR c IN {settings.arango_fix_collection}
          LIMIT @lim
          LET kinds = c.kinds
          LET k = FIRST(FOR kk IN kinds FILTER LIKE(kk, 'aws_%', true) RETURN kk)
          LET svcPos = POSITION(k, '_', 4)
          LET service = svcPos ? SUBSTRING(k, 4, svcPos - 4) : k
          LET rid = c.reported.id || c.reported.arn || TO_STRING(c._key)
          LET name = c.reported.name || (c.reported.tags && c.reported.tags.Name) || rid
          LET az = c.reported.availability_zone
          LET region = c.reported.region || (az ? SUBSTRING(az, 0, LENGTH(az) - 1) : null)
          {hist_segment}
          RETURN {{
            id: rid,
            name: name,
            service: service,
            region: region,
            current: c.reported,
            earliest: earliest ? earliest.reported : null,
            earliestTime: earliest ? (earliest.reported.updated_at || earliest.reported.create_time || earliest.reported.creation_date || earliest.created_at || earliest.updated_at) : null
          }}
        """

        rows = list(db.aql.execute(aql, bind_vars={"lim": limit}))

        items: List[Dict[str, Any]] = []
        crit = med = low = 0

        def flat(d: Dict[str, Any], prefix: str = "", depth: int = 0) -> Dict[str, Any]:
            out: Dict[str, Any] = {}
            if not isinstance(d, dict):
                return out
            for k, v in d.items():
                key = f"{prefix}.{k}" if prefix else k
                if isinstance(v, dict) and depth < 1:  # limit depth to 2 levels
                    out.update(flat(v, key, depth + 1))
                else:
                    out[key] = v
            return out

        critical_keys = {
            "security_groups",
            "public_ip_address",
            "versioning",
            "replication_configuration",
            "backup_retention_period",
            "encrypted",
            "multi_az",
        }

        for r in rows:
            cur = r.get("current") or {}
            old = r.get("earliest") or {}
            if not old:
                continue
            fcur = flat(cur)
            fold = flat(old)
            keys = set(fcur.keys()) | set(fold.keys())
            changes = []
            for k in keys:
                ov = fold.get(k)
                nv = fcur.get(k)
                if ov != nv:
                    # stringify small values
                    def s(x):
                        if isinstance(x, (str, int, float, bool)) or x is None:
                            return str(x)
                        return "…"

                    changes.append({"path": k, "from": s(ov), "to": s(nv)})

            if not changes:
                continue

            # Severity
            sev = "Low"
            if any(k.split(".")[0] in critical_keys for k in [c["path"] for c in changes]) or len(changes) >= 5:
                sev = "High"
                crit += 1
            elif len(changes) >= 3:
                sev = "Medium"
                med += 1
            else:
                low += 1

            first_change = changes[0]
            expected_blob = ", ".join(f"{c['path']}: {c['from']}" for c in changes[:5])
            current_blob = ", ".join(f"{c['path']}: {c['to']}" for c in changes[:5])

            items.append({
                "id": f"drift-{r.get('service','')}-{r.get('id','')}",
                "resourceId": r.get("id"),
                "resourceName": _first_non_empty(r.get("name"), r.get("id")),
                "service": (r.get("service") or "").upper(),
                "region": r.get("region") or "",
                "provider": "AWS",
                "severity": sev,
                "issue": f"{len(changes)} field(s) drifted (e.g., {first_change['path']})",
                "detectedAt": r.get("earliestTime") or datetime.now(timezone.utc).isoformat(),
                "expectedConfig": expected_blob,
                "currentConfig": current_blob,
                "impact": "Configuration changed from baseline",
            })

        summary = {
            "totalResources": len(rows),
            "driftingResources": len(items),
            "criticalDrift": crit,
            "mediumDrift": med,
            "lowDrift": low,
            "lastScan": datetime.now(timezone.utc).isoformat(),
            "nextScan": None,
        }

        return {"summary": summary, "items": items}
