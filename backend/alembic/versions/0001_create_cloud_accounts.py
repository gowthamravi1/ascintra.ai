"""create cloud_accounts

Revision ID: 0001
Revises: 
Create Date: 2025-09-16 00:00:00

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Ensure pgcrypto exists for gen_random_uuid
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')

    op.create_table(
        "cloud_accounts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("account_identifier", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("primary_region", sa.String(), nullable=True),
        sa.Column("aws_role_arn", sa.String(), nullable=True),
        sa.Column("aws_external_id", sa.String(), nullable=True),
        sa.Column("gcp_project_number", sa.String(), nullable=True),
        sa.Column("gcp_sa_email", sa.String(), nullable=True),
        sa.Column("credentials_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("discovery_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("discovery_options", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("connection_status", sa.String(), nullable=False, server_default=sa.text("'unknown'")),
        sa.Column("connection_last_tested_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("provider IN ('aws','gcp')", name="ck_cloud_accounts_provider"),
        sa.UniqueConstraint("provider", "account_identifier", name="uq_cloud_accounts_provider_identifier"),
    )

    # Trigger to update updated_at on update
    op.execute(
        sa.text(
            """
            CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
            BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
            """
        )
    )
    op.execute(
        sa.text(
            """
            DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cloud_accounts_updated_at') THEN
                CREATE TRIGGER trg_cloud_accounts_updated_at
                BEFORE UPDATE ON cloud_accounts
                FOR EACH ROW EXECUTE FUNCTION set_updated_at();
            END IF; END $$;
            """
        )
    )


def downgrade() -> None:
    op.drop_table("cloud_accounts")

