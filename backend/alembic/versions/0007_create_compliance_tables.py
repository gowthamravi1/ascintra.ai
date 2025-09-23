"""Create compliance tables

Revision ID: 0007
Revises: 0006
Create Date: 2025-01-22 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0007'
down_revision = '0006'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create compliance_frameworks table
    op.create_table('compliance_frameworks',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('version', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create compliance_rules table
    op.create_table('compliance_rules',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('framework_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('rule_id', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('resource_type', sa.String(), nullable=False),
        sa.Column('field_path', sa.String(), nullable=False),
        sa.Column('operator', sa.String(), nullable=False),
        sa.Column('expected_value', sa.JSON(), nullable=True),
        sa.Column('severity', sa.String(), nullable=False),
        sa.Column('remediation', sa.String(), nullable=True),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['framework_id'], ['compliance_frameworks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('framework_id', 'rule_id', name='uq_compliance_rules_framework_rule')
    )

    # Create compliance_evaluations table
    op.create_table('compliance_evaluations',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('account_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('framework_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('evaluation_date', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('total_rules', sa.Integer(), nullable=False),
        sa.Column('passed_rules', sa.Integer(), nullable=False),
        sa.Column('failed_rules', sa.Integer(), nullable=False),
        sa.Column('compliance_score', sa.Float(), nullable=False),
        sa.Column('evaluation_data', sa.JSON(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['account_id'], ['cloud_accounts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['framework_id'], ['compliance_frameworks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('account_id', 'framework_id', 'evaluation_date', name='uq_compliance_evaluations_account_framework_date')
    )

    # Create compliance_rule_results table
    op.create_table('compliance_rule_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('evaluation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('rule_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('passed', sa.Boolean(), nullable=False),
        sa.Column('failed_resources', sa.JSON(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column('error_message', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['evaluation_id'], ['compliance_evaluations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['rule_id'], ['compliance_rules.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('compliance_rule_results')
    op.drop_table('compliance_evaluations')
    op.drop_table('compliance_rules')
    op.drop_table('compliance_frameworks')
