from __future__ import annotations

from typing import Optional

from app.db.arango import get_db


class ConfigService:
    def update_fix_worker_aws_credentials(
        self,
        access_key_id: str,
        secret_access_key: str,
        account: Optional[str] = None,
        region: Optional[str] = None,
    ) -> bool:
        """Update the configs/fix.worker document with AWS credentials.

        If Arango is not configured, returns False. Returns True on successful update.
        """
        db = get_db()
        if db is None:
            return False
        try:
            col = db.collection("configs")
            doc = col.get("fix.worker")
            if not doc:
                # create a minimal document if missing
                doc = {
                    "_key": "fix.worker",
                    "config": {
                        "aws": {
                            "access_key_id": None,
                            "secret_access_key": None,
                            "account": None,
                            "region": None,
                        }
                    },
                }
                col.insert(doc)

            cfg = doc.setdefault("config", {})
            aws = cfg.setdefault("aws", {})
            aws["access_key_id"] = access_key_id
            aws["secret_access_key"] = secret_access_key
            # Include account as a list (per fix.worker schema expectations)
            if account:
                existing = aws.get("account")
                if isinstance(existing, list):
                    if account not in existing:
                        existing.append(account)
                    aws["account"] = existing
                elif isinstance(existing, str) and existing:
                    # convert single string to list, ensure uniqueness
                    vals = [existing]
                    if account not in vals:
                        vals.append(account)
                    aws["account"] = vals
                else:
                    aws["account"] = [account]
            # Do not persist region for now
            if "region" in aws:
                aws.pop("region", None)

            # Ensure fixworker.collector contains "aws"
            fixworker = cfg.setdefault("fixworker", {})
            collectors = fixworker.setdefault("collector", [])
            # Avoid duplicates and non-list edge cases
            if not isinstance(collectors, list):
                collectors = []
            if "aws" not in collectors:
                collectors.append("aws")
            fixworker["collector"] = collectors

            col.update(doc)
            return True
        except Exception:
            return False
