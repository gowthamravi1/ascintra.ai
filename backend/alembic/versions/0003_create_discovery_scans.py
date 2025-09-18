"""create discovery_scans table

Revision ID: 0003
Revises: 0002
Create Date: 2025-09-17 00:00:00

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'discovery_scans',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('scan_id', sa.String(), nullable=False, unique=True),
        sa.Column('account_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('cloud_accounts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('resources_scanned', sa.Integer(), nullable=True),
        sa.Column('resources_with_backups', sa.Integer(), nullable=True),
        sa.Column('findings', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column('recovery_score', sa.Integer(), nullable=True),
        sa.Column('backup_coverage', sa.Float(), nullable=True),
        sa.Column('triggered_by', sa.String(), nullable=True),
        sa.Column('region', sa.String(), nullable=True),
        sa.Column('progress', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_discovery_scans_account_id', 'discovery_scans', ['account_id'])
    op.create_index('ix_discovery_scans_created_at', 'discovery_scans', ['created_at'])


def downgrade() -> None:
    op.drop_index('ix_discovery_scans_created_at', table_name='discovery_scans')
    op.drop_index('ix_discovery_scans_account_id', table_name='discovery_scans')
    op.drop_table('discovery_scans')

