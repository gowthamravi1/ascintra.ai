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
    Integer,
    Float,
    ForeignKey,
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
    # discovery schedule
    discovery_frequency = Column(String)  # e.g., '6h', '12h', 'daily', 'weekly'
    preferred_time_utc = Column(String)   # e.g., '02:00'
    connection_status = Column(String, nullable=False, server_default=text("'unknown'"))
    connection_last_tested_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    __table_args__ = (
        CheckConstraint("provider IN ('aws','gcp')", name="ck_cloud_accounts_provider"),
        UniqueConstraint("provider", "account_identifier", name="uq_cloud_accounts_provider_identifier"),
    )


class DiscoveryScan(Base):
    __tablename__ = "discovery_scans"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    scan_id = Column(String, nullable=False, unique=True)  # e.g., scan-001
    account_id = Column(UUID(as_uuid=True), ForeignKey("cloud_accounts.id", ondelete="CASCADE"), nullable=False)

    type = Column(String, nullable=False)  # full | incremental | compliance | backup-validation
    status = Column(String, nullable=False)  # completed | running | failed | cancelled
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True))
    duration_seconds = Column(Integer)
    resources_scanned = Column(Integer)
    resources_with_backups = Column(Integer)
    findings = Column(JSON, nullable=False, server_default=text("'{}'::jsonb"))
    recovery_score = Column(Integer)
    backup_coverage = Column(Float)
    triggered_by = Column(String)
    region = Column(String)
    progress = Column(Integer)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class AssetsInventory(Base):
    __tablename__ = "assets_inventory"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    account_id = Column(UUID(as_uuid=True), ForeignKey("cloud_accounts.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String, nullable=False)
    service = Column(String, nullable=False)
    kind = Column(String, nullable=False)
    resource_id = Column(String, nullable=False)
    name = Column(String)
    type = Column(String)
    status = Column(String)  # protected | unprotected | partial
    region = Column(String)
    last_backup = Column(DateTime(timezone=True))
    arango_id = Column(String)  # e.g., collection/_key for cross-ref
    tags = Column(JSON, nullable=False, server_default=text("'{}'::jsonb"))

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    __table_args__ = (
        UniqueConstraint("account_id", "service", "kind", "resource_id", name="uq_assets_inventory_asset"),
    )
