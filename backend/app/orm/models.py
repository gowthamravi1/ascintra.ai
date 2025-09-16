from __future__ import annotations

from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    text,
    JSON,
    CheckConstraint,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import UUID


Base = declarative_base()


class CloudAccount(Base):
    __tablename__ = "cloud_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    provider = Column(String, nullable=False)
    account_identifier = Column(String, nullable=False)
    name = Column(String)
    primary_region = Column(String)

    aws_role_arn = Column(String)
    aws_external_id = Column(String)
    gcp_project_number = Column(String)
    gcp_sa_email = Column(String)

    credentials_json = Column(JSON)
    discovery_enabled = Column(Boolean, nullable=False, server_default=text("true"))
    discovery_options = Column(JSON, nullable=False, server_default=text("'{}'::jsonb"))
    connection_status = Column(String, nullable=False, server_default=text("'unknown'"))
    connection_last_tested_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    __table_args__ = (
        CheckConstraint("provider IN ('aws','gcp')", name="ck_cloud_accounts_provider"),
        UniqueConstraint("provider", "account_identifier", name="uq_cloud_accounts_provider_identifier"),
    )

