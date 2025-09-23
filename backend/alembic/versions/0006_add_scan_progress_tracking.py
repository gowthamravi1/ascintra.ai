"""add_scan_progress_tracking

Revision ID: 0006
Revises: 0005
Create Date: 2025-09-22 05:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0006'
down_revision = '0005'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to discovery_scans table for progress tracking
    op.add_column('discovery_scans', sa.Column('scan_type', sa.String(), nullable=True))
    op.add_column('discovery_scans', sa.Column('current_phase', sa.String(), nullable=True))
    op.add_column('discovery_scans', sa.Column('phase_progress', sa.Integer(), nullable=True))
    op.add_column('discovery_scans', sa.Column('total_phases', sa.Integer(), nullable=True))
    op.add_column('discovery_scans', sa.Column('current_phase_start', sa.DateTime(timezone=True), nullable=True))
    op.add_column('discovery_scans', sa.Column('estimated_completion', sa.DateTime(timezone=True), nullable=True))
    op.add_column('discovery_scans', sa.Column('error_message', sa.Text(), nullable=True))
    op.add_column('discovery_scans', sa.Column('scan_metadata', sa.JSON(), nullable=True))
    
    # Update existing records to have default values
    op.execute("""
        UPDATE discovery_scans 
        SET scan_type = 'inventory',
            current_phase = 'completed',
            phase_progress = 100,
            total_phases = 4,
            scan_metadata = '{}'::jsonb
        WHERE status = 'completed'
    """)
    
    op.execute("""
        UPDATE discovery_scans 
        SET scan_type = 'inventory',
            current_phase = 'failed',
            phase_progress = 0,
            total_phases = 4,
            scan_metadata = '{}'::jsonb
        WHERE status = 'failed'
    """)
    
    op.execute("""
        UPDATE discovery_scans 
        SET scan_type = 'inventory',
            current_phase = 'cancelled',
            phase_progress = 0,
            total_phases = 4,
            scan_metadata = '{}'::jsonb
        WHERE status = 'cancelled'
    """)
    
    # Make scan_type not nullable after setting defaults
    op.alter_column('discovery_scans', 'scan_type', nullable=False)
    op.alter_column('discovery_scans', 'total_phases', nullable=False)
    op.alter_column('discovery_scans', 'scan_metadata', nullable=False)


def downgrade():
    # Remove the added columns
    op.drop_column('discovery_scans', 'scan_metadata')
    op.drop_column('discovery_scans', 'error_message')
    op.drop_column('discovery_scans', 'estimated_completion')
    op.drop_column('discovery_scans', 'current_phase_start')
    op.drop_column('discovery_scans', 'total_phases')
    op.drop_column('discovery_scans', 'phase_progress')
    op.drop_column('discovery_scans', 'current_phase')
    op.drop_column('discovery_scans', 'scan_type')
