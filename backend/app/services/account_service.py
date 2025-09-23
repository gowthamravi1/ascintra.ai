from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import List

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.models.account import AccountCreate, Account
from app.models.account_detail import AccountDetail
from app.orm.models import CloudAccount
from fastapi import HTTPException
from uuid import UUID

logger = logging.getLogger(__name__)


class AccountService:
    def create(self, data: AccountCreate) -> Account:
        session: Session = get_session()
        try:
            # Merge credentials JSON with provided AWS keys if present
            creds = data.credentials_json or {}
            if data.provider == "aws" and data.aws_access_key_id and data.aws_secret_access_key:
                aws_creds = creds.get("aws", {})
                aws_creds.update({
                    "access_key_id": data.aws_access_key_id,
                    "secret_access_key": data.aws_secret_access_key,
                })
                # Optionally include account and region context
                if data.account_identifier:
                    aws_creds.setdefault("account", data.account_identifier)
                if data.primary_region:
                    aws_creds.setdefault("region", data.primary_region)
                creds["aws"] = aws_creds

            # Handle GCP credentials and config update
            logger.info(f"DEBUG: Account creation - provider={data.provider}, has_creds={bool(data.credentials_json)}, gcp_in_creds={'gcp' in data.credentials_json if data.credentials_json else False}")
            if data.provider == "gcp" and data.credentials_json and "gcp" in data.credentials_json:
                gcp_creds = data.credentials_json["gcp"]
                logger.info(f"DEBUG: GCP credentials found, calling ConfigService.update_fix_worker_gcp_credentials")
                # Update Fix Inventory Worker config with GCP credentials
                try:
                    from app.services.config_service import ConfigService
                    config_updated = ConfigService().update_fix_worker_gcp_credentials(
                        project_id=data.account_identifier,
                        service_account_json=gcp_creds,
                        project_number=data.gcp_project_number
                    )
                    if not config_updated:
                        logger.warning(f"Failed to update Fix Inventory Worker config for GCP project {data.account_identifier}")
                except Exception as e:
                    logger.warning(f"Error updating Fix Inventory Worker config for GCP: {e}")
            else:
                logger.info(f"DEBUG: GCP config update skipped - provider={data.provider}, has_creds={bool(data.credentials_json)}")

            obj = CloudAccount(
                provider=data.provider,
                account_identifier=data.account_identifier,
                name=data.name,
                primary_region=data.primary_region,
                aws_role_arn=data.aws_role_arn,
                aws_external_id=data.aws_external_id,
                gcp_project_number=data.gcp_project_number,
                gcp_sa_email=data.gcp_sa_email,
                credentials_json=creds,
                discovery_enabled=data.discovery_enabled,
                discovery_options=data.discovery_options or {},
                discovery_frequency=data.discovery_frequency,
                preferred_time_utc=data.preferred_time_utc,
                connection_status="connected",
                connection_last_tested_at=datetime.now(timezone.utc),
            )
            session.add(obj)
            session.commit()
            session.refresh(obj)
            # Kick off initial discovery scan and inventory materialization (best-effort)
            try:
                from app.services.discovery_service import DiscoveryService

                DiscoveryService().run_scan_for_account_by_identifier(data.account_identifier, triggered_by="setup")
            except Exception:
                # Ignore failures here to not block account creation
                pass

            return Account(
                id=str(obj.id),
                provider=obj.provider,
                account_identifier=obj.account_identifier,
                name=obj.name,
                primary_region=obj.primary_region,
                connection_status=obj.connection_status,
            )
        finally:
            session.close()

    def list(self) -> List[Account]:
        session: Session = get_session()
        try:
            rows = session.execute(
                select(
                    CloudAccount.id,
                    CloudAccount.provider,
                    CloudAccount.account_identifier,
                    CloudAccount.name,
                    CloudAccount.primary_region,
                    CloudAccount.connection_status,
                ).order_by(CloudAccount.created_at.desc())
            ).all()
            return [
                Account(
                    id=str(r.id),
                    provider=r.provider,
                    account_identifier=r.account_identifier,
                    name=r.name,
                    primary_region=r.primary_region,
                    connection_status=r.connection_status,
                )
                for r in rows
            ]
        finally:
            session.close()

    def get(self, account_id: str) -> AccountDetail:
        session: Session = get_session()
        try:
            try:
                uid = UUID(account_id)
            except Exception:
                raise HTTPException(status_code=400, detail="invalid id")
            obj = session.get(CloudAccount, uid)
            if not obj:
                raise HTTPException(status_code=404, detail="not found")
            return AccountDetail(
                id=str(obj.id),
                provider=obj.provider,
                account_identifier=obj.account_identifier,
                name=obj.name,
                primary_region=obj.primary_region,
                aws_role_arn=obj.aws_role_arn,
                aws_external_id=obj.aws_external_id,
                gcp_project_number=obj.gcp_project_number,
                gcp_sa_email=obj.gcp_sa_email,
                credentials_json=obj.credentials_json or None,
                discovery_enabled=bool(obj.discovery_enabled),
                discovery_options=obj.discovery_options or {},
                discovery_frequency=obj.discovery_frequency,
                preferred_time_utc=obj.preferred_time_utc,
                connection_status=obj.connection_status,
                connection_last_tested_at=(obj.connection_last_tested_at.isoformat() if obj.connection_last_tested_at else None),
                created_at=(obj.created_at.isoformat() if obj.created_at else None),
                updated_at=(obj.updated_at.isoformat() if obj.updated_at else None),
            )
        finally:
            session.close()
