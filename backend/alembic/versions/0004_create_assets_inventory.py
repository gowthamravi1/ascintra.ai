"""create assets_inventory table

Revision ID: 0004
Revises: 0003
Create Date: 2025-09-21 00:00:00

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'assets_inventory',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('account_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('cloud_accounts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('provider', sa.String(), nullable=False),
        sa.Column('service', sa.String(), nullable=False),
        sa.Column('kind', sa.String(), nullable=False),
        sa.Column('resource_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('type', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('region', sa.String(), nullable=True),
        sa.Column('last_backup', sa.DateTime(timezone=True), nullable=True),
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('account_id', 'service', 'kind', 'resource_id', name='uq_assets_inventory_asset'),
    )
    op.create_index('ix_assets_inventory_account_id', 'assets_inventory', ['account_id'])
    op.create_index('ix_assets_inventory_service', 'assets_inventory', ['service'])
    op.create_index('ix_assets_inventory_region', 'assets_inventory', ['region'])


def downgrade() -> None:
    op.drop_index('ix_assets_inventory_region', table_name='assets_inventory')
    op.drop_index('ix_assets_inventory_service', table_name='assets_inventory')
    op.drop_index('ix_assets_inventory_account_id', table_name='assets_inventory')
    op.drop_table('assets_inventory')

