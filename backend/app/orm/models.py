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

    # Legacy fields (keeping for backward compatibility)
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
    
    # New progress tracking fields
    scan_type = Column(String, nullable=False)  # inventory | vulnerability | compliance | backup_validation | drift_detection | cost_optimization
    current_phase = Column(String)  # initializing | discovering | analyzing | materializing | finalizing
    phase_progress = Column(Integer)  # 0-100 progress within current phase
    total_phases = Column(Integer, nullable=False)  # Total number of phases for this scan type
    current_phase_start = Column(DateTime(timezone=True))  # When current phase started
    estimated_completion = Column(DateTime(timezone=True))  # Estimated completion time
    error_message = Column(String)  # Error details if scan failed
    scan_metadata = Column(JSON, nullable=False, server_default=text("'{}'::jsonb"))  # Additional scan-specific data

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


class ComplianceFramework(Base):
    __tablename__ = "compliance_frameworks"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    name = Column(String, nullable=False, unique=True)  # e.g., "SOC 2", "DORA"
    version = Column(String)  # e.g., "Type II", "2024"
    description = Column(String)
    enabled = Column(Boolean, nullable=False, server_default=text("true"))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class ComplianceRule(Base):
    __tablename__ = "compliance_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    framework_id = Column(UUID(as_uuid=True), ForeignKey("compliance_frameworks.id", ondelete="CASCADE"), nullable=False)
    rule_id = Column(String, nullable=False)  # e.g., "soc2-s3-public"
    category = Column(String, nullable=False)  # e.g., "Security", "ICT Risk Management"
    description = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)  # e.g., "aws_s3_bucket", "aws_ec2_instance"
    field_path = Column(String, nullable=False)  # e.g., "reported.public", "reported.encryption_enabled"
    operator = Column(String, nullable=False)  # e.g., "equals", "not_equals", "contains", "greater_than"
    expected_value = Column(JSON)  # The expected value for comparison
    severity = Column(String, nullable=False)  # e.g., "high", "medium", "low"
    remediation = Column(String)  # Remediation guidance
    enabled = Column(Boolean, nullable=False, server_default=text("true"))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    __table_args__ = (
        UniqueConstraint("framework_id", "rule_id", name="uq_compliance_rules_framework_rule"),
    )


class ComplianceEvaluation(Base):
    __tablename__ = "compliance_evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    account_id = Column(UUID(as_uuid=True), ForeignKey("cloud_accounts.id", ondelete="CASCADE"), nullable=False)
    framework_id = Column(UUID(as_uuid=True), ForeignKey("compliance_frameworks.id", ondelete="CASCADE"), nullable=False)
    evaluation_date = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    total_rules = Column(Integer, nullable=False)
    passed_rules = Column(Integer, nullable=False)
    failed_rules = Column(Integer, nullable=False)
    compliance_score = Column(Float, nullable=False)  # 0-100
    evaluation_data = Column(JSON, nullable=False, server_default=text("'{}'::jsonb"))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    __table_args__ = (
        UniqueConstraint("account_id", "framework_id", "evaluation_date", name="uq_compliance_evaluations_account_framework_date"),
    )


class ComplianceRuleResult(Base):
    __tablename__ = "compliance_rule_results"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("compliance_evaluations.id", ondelete="CASCADE"), nullable=False)
    rule_id = Column(UUID(as_uuid=True), ForeignKey("compliance_rules.id", ondelete="CASCADE"), nullable=False)
    passed = Column(Boolean, nullable=False)
    failed_resources = Column(JSON, nullable=False, server_default=text("'[]'::jsonb"))
    error_message = Column(String)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
