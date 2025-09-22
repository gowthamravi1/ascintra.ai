"""add arango_id to assets_inventory

Revision ID: 0005
Revises: 0004
Create Date: 2025-09-21 00:15:00

"""

from alembic import op
import sqlalchemy as sa


revision = '0005'
down_revision = '0004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('assets_inventory', sa.Column('arango_id', sa.String(), nullable=True))
    op.create_index('ix_assets_inventory_arango_id', 'assets_inventory', ['arango_id'])


def downgrade() -> None:
    op.drop_index('ix_assets_inventory_arango_id', table_name='assets_inventory')
    op.drop_column('assets_inventory', 'arango_id')

