from __future__ import annotations

from typing import Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import update

from app.db.session import get_session
from app.orm.models import DiscoveryScan
from app.models.scan_types import ScanType, ScanPhase, get_scan_phases, get_phase_progress, get_scan_config
import logging

logger = logging.getLogger(__name__)


class ScanProgressService:
    """Service for tracking scan progress and phases"""
    
    def __init__(self):
        self.session = get_session()
    
    def start_scan(self, scan_id: str, scan_type: ScanType, account_identifier: str) -> bool:
        """Initialize a new scan with progress tracking"""
        try:
            config = get_scan_config(scan_type)
            phases = get_scan_phases(scan_type)
            
            # Calculate estimated completion time
            estimated_duration = timedelta(minutes=config["estimated_duration_minutes"])
            estimated_completion = datetime.now(timezone.utc) + estimated_duration
            
            # Update scan record with progress tracking info
            update_data = {
                DiscoveryScan.scan_type: scan_type.value,
                DiscoveryScan.current_phase: ScanPhase.INITIALIZING.value,
                DiscoveryScan.phase_progress: 0,
                DiscoveryScan.total_phases: len(phases),
                DiscoveryScan.current_phase_start: datetime.now(timezone.utc),
                DiscoveryScan.estimated_completion: estimated_completion,
                DiscoveryScan.scan_metadata: {
                    "account_identifier": account_identifier,
                    "scan_config": config,
                    "phases": [phase.value for phase in phases]
                }
            }
            
            self.session.execute(
                update(DiscoveryScan)
                .where(DiscoveryScan.scan_id == scan_id)
                .values(**update_data)
            )
            self.session.commit()
            
            logger.info(f"Started scan {scan_id} of type {scan_type.value} with {len(phases)} phases")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start scan progress tracking for {scan_id}: {e}")
            self.session.rollback()
            return False
    
    def update_phase(self, scan_id: str, phase: ScanPhase, phase_progress: int = 0) -> bool:
        """Update the current phase and progress for a scan"""
        try:
            # Get scan info to calculate overall progress
            scan = self.session.query(DiscoveryScan).filter(DiscoveryScan.scan_id == scan_id).first()
            if not scan:
                logger.error(f"Scan {scan_id} not found")
                return False
            
            # Calculate overall progress
            total_phases = scan.total_phases or 1
            overall_progress = get_phase_progress(phase, total_phases)
            
            update_data = {
                DiscoveryScan.current_phase: phase.value,
                DiscoveryScan.phase_progress: min(100, max(0, phase_progress)),
                DiscoveryScan.progress: overall_progress,
                DiscoveryScan.current_phase_start: datetime.now(timezone.utc),
                DiscoveryScan.updated_at: datetime.now(timezone.utc)
            }
            
            self.session.execute(
                update(DiscoveryScan)
                .where(DiscoveryScan.scan_id == scan_id)
                .values(**update_data)
            )
            self.session.commit()
            
            logger.info(f"Updated scan {scan_id} to phase {phase.value} ({phase_progress}% within phase, {overall_progress}% overall)")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update phase for scan {scan_id}: {e}")
            self.session.rollback()
            return False
    
    def update_phase_progress(self, scan_id: str, phase_progress: int) -> bool:
        """Update progress within the current phase (0-100)"""
        try:
            phase_progress = min(100, max(0, phase_progress))
            
            # Get current scan info
            scan = self.session.query(DiscoveryScan).filter(DiscoveryScan.scan_id == scan_id).first()
            if not scan:
                return False
            
            # Calculate overall progress
            total_phases = scan.total_phases or 1
            current_phase = scan.current_phase
            if current_phase:
                try:
                    phase_enum = ScanPhase(current_phase)
                    overall_progress = get_phase_progress(phase_enum, total_phases)
                except ValueError:
                    overall_progress = scan.progress or 0
            else:
                overall_progress = scan.progress or 0
            
            update_data = {
                DiscoveryScan.phase_progress: phase_progress,
                DiscoveryScan.progress: overall_progress,
                DiscoveryScan.updated_at: datetime.now(timezone.utc)
            }
            
            self.session.execute(
                update(DiscoveryScan)
                .where(DiscoveryScan.scan_id == scan_id)
                .values(**update_data)
            )
            self.session.commit()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to update phase progress for scan {scan_id}: {e}")
            self.session.rollback()
            return False
    
    def complete_scan(self, scan_id: str, success: bool = True, error_message: Optional[str] = None) -> bool:
        """Mark a scan as completed or failed"""
        try:
            update_data = {
                DiscoveryScan.status: "completed" if success else "failed",
                DiscoveryScan.end_time: datetime.now(timezone.utc),
                DiscoveryScan.progress: 100 if success else 0,
                DiscoveryScan.phase_progress: 100 if success else 0,
                DiscoveryScan.current_phase: ScanPhase.FINALIZING.value if success else "failed",
                DiscoveryScan.updated_at: datetime.now(timezone.utc)
            }
            
            if error_message:
                update_data[DiscoveryScan.error_message] = error_message
            
            self.session.execute(
                update(DiscoveryScan)
                .where(DiscoveryScan.scan_id == scan_id)
                .values(**update_data)
            )
            self.session.commit()
            
            status = "completed" if success else "failed"
            logger.info(f"Marked scan {scan_id} as {status}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to complete scan {scan_id}: {e}")
            self.session.rollback()
            return False
    
    def get_scan_progress(self, scan_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed progress information for a scan"""
        try:
            scan = self.session.query(DiscoveryScan).filter(DiscoveryScan.scan_id == scan_id).first()
            if not scan:
                return None
            
            # Calculate time estimates
            current_time = datetime.now(timezone.utc)
            elapsed_time = current_time - scan.start_time
            
            estimated_completion = scan.estimated_completion
            remaining_time = None
            if estimated_completion and scan.status == "running":
                remaining_time = max(timedelta(0), estimated_completion - current_time)
            
            return {
                "scan_id": scan.scan_id,
                "scan_type": scan.scan_type,
                "status": scan.status,
                "current_phase": scan.current_phase,
                "phase_progress": scan.phase_progress or 0,
                "overall_progress": scan.progress or 0,
                "total_phases": scan.total_phases or 1,
                "elapsed_time_seconds": int(elapsed_time.total_seconds()),
                "estimated_completion": estimated_completion.isoformat() if estimated_completion else None,
                "remaining_time_seconds": int(remaining_time.total_seconds()) if remaining_time else None,
                "error_message": scan.error_message,
                "scan_metadata": scan.scan_metadata or {}
            }
            
        except Exception as e:
            logger.error(f"Failed to get scan progress for {scan_id}: {e}")
            return None
    
    def cleanup_old_scans(self, days_old: int = 30) -> int:
        """Clean up old completed scans to keep database size manageable"""
        try:
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_old)
            
            # Delete old completed scans
            result = self.session.query(DiscoveryScan).filter(
                DiscoveryScan.status.in_(["completed", "failed", "cancelled"]),
                DiscoveryScan.created_at < cutoff_date
            ).delete()
            
            self.session.commit()
            logger.info(f"Cleaned up {result} old scans")
            return result
            
        except Exception as e:
            logger.error(f"Failed to cleanup old scans: {e}")
            self.session.rollback()
            return 0
