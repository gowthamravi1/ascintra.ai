"""add discovery schedule fields

Revision ID: 0002
Revises: 0001
Create Date: 2025-09-17 00:00:00

"""

from alembic import op
import sqlalchemy as sa


revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('cloud_accounts', sa.Column('discovery_frequency', sa.String(), nullable=True))
    op.add_column('cloud_accounts', sa.Column('preferred_time_utc', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('cloud_accounts', 'preferred_time_utc')
    op.drop_column('cloud_accounts', 'discovery_frequency')

