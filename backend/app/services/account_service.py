from __future__ import annotations

from datetime import datetime, timezone
from typing import List

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.models.account import AccountCreate, Account
from app.orm.models import CloudAccount


class AccountService:
    def create(self, data: AccountCreate) -> Account:
        session: Session = get_session()
        try:
            obj = CloudAccount(
                provider=data.provider,
                account_identifier=data.account_identifier,
                name=data.name,
                primary_region=data.primary_region,
                aws_role_arn=data.aws_role_arn,
                aws_external_id=data.aws_external_id,
                gcp_project_number=data.gcp_project_number,
                gcp_sa_email=data.gcp_sa_email,
                credentials_json=data.credentials_json or {},
                discovery_enabled=data.discovery_enabled,
                discovery_options=data.discovery_options or {},
                connection_status="connected",
                connection_last_tested_at=datetime.now(timezone.utc),
            )
            session.add(obj)
            session.commit()
            session.refresh(obj)
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
