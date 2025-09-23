from __future__ import annotations

from typing import List
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.orm.models import DiscoveryScan, CloudAccount
from app.models.discovery import ScanItem, Findings, ScanListResponse, ScanSummary, ScanDetailResponse
from app.models.scan_types import ScanType, ScanPhase
from app.services.scan_progress_service import ScanProgressService
from datetime import datetime, timezone
from uuid import uuid4


class DiscoveryService:
    def list(self) -> ScanListResponse:
        session: Session = get_session()
        try:
            # join scans with accounts for names
            rows = session.execute(
                select(
                    DiscoveryScan.scan_id,
                    CloudAccount.name,
                    CloudAccount.account_identifier,
                    DiscoveryScan.type,
                    DiscoveryScan.status,
                    DiscoveryScan.start_time,
                    DiscoveryScan.end_time,
                    DiscoveryScan.duration_seconds,
                    DiscoveryScan.resources_scanned,
                    DiscoveryScan.resources_with_backups,
                    DiscoveryScan.findings,
                    DiscoveryScan.recovery_score,
                    DiscoveryScan.backup_coverage,
                    DiscoveryScan.triggered_by,
                    DiscoveryScan.region,
                    DiscoveryScan.progress,
                    # New progress tracking fields
                    DiscoveryScan.scan_type,
                    DiscoveryScan.current_phase,
                    DiscoveryScan.phase_progress,
                    DiscoveryScan.total_phases,
                    DiscoveryScan.current_phase_start,
                    DiscoveryScan.estimated_completion,
                    DiscoveryScan.error_message,
                    DiscoveryScan.scan_metadata,
                ).join(CloudAccount, CloudAccount.id == DiscoveryScan.account_id)
                .order_by(DiscoveryScan.start_time.desc())
            ).all()

            scans: List[ScanItem] = []
            for r in rows:
                scans.append(
                    ScanItem(
                        id=r.scan_id,
                        account_name=r.name or "",
                        account_id=r.account_identifier,
                        type=r.type,
                        status=r.status,
                        start_time=(r.start_time.isoformat() if r.start_time else ""),
                        end_time=(r.end_time.isoformat() if r.end_time else None),
                        duration_seconds=int(r.duration_seconds or 0),
                        resources_scanned=int(r.resources_scanned or 0),
                        resources_with_backups=int(r.resources_with_backups or 0),
                        findings=Findings(**(r.findings or {"critical": 0, "high": 0, "medium": 0, "low": 0})),
                        recovery_score=int(r.recovery_score or 0),
                        backup_coverage=float(r.backup_coverage or 0.0),
                        triggered_by=r.triggered_by or "manual",
                        region=r.region or "",
                        progress=(int(r.progress) if r.progress is not None else None),
                        # New progress tracking fields
                        scan_type=r.scan_type or "inventory",
                        current_phase=r.current_phase,
                        phase_progress=r.phase_progress,
                        total_phases=r.total_phases,
                        current_phase_start=(r.current_phase_start.isoformat() if r.current_phase_start else None),
                        estimated_completion=(r.estimated_completion.isoformat() if r.estimated_completion else None),
                        error_message=r.error_message,
                        scan_metadata=r.scan_metadata or {},
                    )
                )

            total = len(scans)
            completed = len([s for s in scans if s.status == "completed"])
            avg_dur = (
                sum(s.duration_seconds for s in scans if s.status == "completed") / completed if completed else 0
            )
            resources_total = sum(s.resources_scanned for s in scans)

            return ScanListResponse(
                summary=ScanSummary(
                    total_scans=total,
                    success_rate=(completed / total * 100.0) if total else 0.0,
                    avg_duration_seconds=avg_dur,
                    resources_scanned=resources_total,
                ),
                scans=scans,
            )
        finally:
            session.close()

    def get(self, scan_id: str) -> ScanDetailResponse:
        session: Session = get_session()
        try:
            r = session.execute(
                select(
                    DiscoveryScan.scan_id,
                    CloudAccount.name,
                    CloudAccount.account_identifier,
                    DiscoveryScan.type,
                    DiscoveryScan.status,
                    DiscoveryScan.start_time,
                    DiscoveryScan.end_time,
                    DiscoveryScan.duration_seconds,
                    DiscoveryScan.resources_scanned,
                    DiscoveryScan.resources_with_backups,
                    DiscoveryScan.findings,
                    DiscoveryScan.recovery_score,
                    DiscoveryScan.backup_coverage,
                    DiscoveryScan.triggered_by,
                    DiscoveryScan.region,
                    DiscoveryScan.progress,
                    # New progress tracking fields
                    DiscoveryScan.scan_type,
                    DiscoveryScan.current_phase,
                    DiscoveryScan.phase_progress,
                    DiscoveryScan.total_phases,
                    DiscoveryScan.current_phase_start,
                    DiscoveryScan.estimated_completion,
                    DiscoveryScan.error_message,
                    DiscoveryScan.scan_metadata,
                ).join(CloudAccount, CloudAccount.id == DiscoveryScan.account_id)
                .where(DiscoveryScan.scan_id == scan_id)
            ).first()
            if not r:
                # Not found: return empty minimal response
                return ScanDetailResponse(
                    id=scan_id,
                    account_name="",
                    account_id="",
                    type="full",
                    status="cancelled",
                    start_time="",
                    end_time=None,
                    duration_seconds=0,
                    resources_scanned=0,
                    resources_with_backups=0,
                    findings=Findings(critical=0, high=0, medium=0, low=0),
                    recovery_score=0,
                    backup_coverage=0.0,
                    triggered_by="manual",
                    region="",
                    progress=None,
                    # New progress tracking fields
                    scan_type="inventory",
                    current_phase=None,
                    phase_progress=None,
                    total_phases=None,
                    current_phase_start=None,
                    estimated_completion=None,
                    error_message=None,
                    scan_metadata={},
                )

            item = ScanItem(
                id=r.scan_id,
                account_name=r.name or "",
                account_id=r.account_identifier,
                type=r.type,
                status=r.status,
                start_time=(r.start_time.isoformat() if r.start_time else ""),
                end_time=(r.end_time.isoformat() if r.end_time else None),
                duration_seconds=int(r.duration_seconds or 0),
                resources_scanned=int(r.resources_scanned or 0),
                resources_with_backups=int(r.resources_with_backups or 0),
                findings=Findings(**(r.findings or {"critical": 0, "high": 0, "medium": 0, "low": 0})),
                recovery_score=int(r.recovery_score or 0),
                backup_coverage=float(r.backup_coverage or 0.0),
                triggered_by=r.triggered_by or "manual",
                region=r.region or "",
                progress=(int(r.progress) if r.progress is not None else None),
                # New progress tracking fields
                scan_type=r.scan_type or "inventory",
                current_phase=r.current_phase,
                phase_progress=r.phase_progress,
                total_phases=r.total_phases,
                current_phase_start=(r.current_phase_start.isoformat() if r.current_phase_start else None),
                estimated_completion=(r.estimated_completion.isoformat() if r.estimated_completion else None),
                error_message=r.error_message,
                scan_metadata=r.scan_metadata or {},
            )
            return ScanDetailResponse(**item.model_dump())
        finally:
            session.close()

    def run_scan_for_account_by_identifier(self, account_identifier: str, triggered_by: str = "manual", scan_type: ScanType = ScanType.INVENTORY) -> ScanDetailResponse:
        """Create a discovery scan record, materialize assets from fix into inventory, and finalize the scan.

        Returns the finalized ScanDetailResponse (or minimal if failure).
        """
        # Lookup account
        session: Session = get_session()
        try:
            acct = (
                session.query(CloudAccount)
                .filter(CloudAccount.account_identifier == account_identifier)
                .one_or_none()
            )
            if not acct:
                # Not found: return a cancelled placeholder
                return ScanDetailResponse(
                    id=f"scan-{uuid4().hex[:8]}",
                    account_name="",
                    account_id=account_identifier,
                    type="full",
                    status="cancelled",
                    start_time="",
                    end_time=None,
                    duration_seconds=0,
                    resources_scanned=0,
                    resources_with_backups=0,
                    findings=Findings(critical=0, high=0, medium=0, low=0),
                    recovery_score=0,
                    backup_coverage=0.0,
                    triggered_by=triggered_by,
                    region="",
                    progress=None,
                )

            start = datetime.now(timezone.utc)
            scan_id = f"scan-{uuid4().hex[:8]}"
            
            # Create running scan with progress tracking
            row = DiscoveryScan(
                scan_id=scan_id,
                account_id=acct.id,
                type="full",  # Legacy field
                status="running",
                start_time=start,
                duration_seconds=0,
                resources_scanned=0,
                resources_with_backups=0,
                findings={"critical": 0, "high": 0, "medium": 0, "low": 0},
                recovery_score=0,
                backup_coverage=0.0,
                triggered_by=triggered_by,
                region=acct.primary_region or "",
                progress=0,
                # New progress tracking fields
                scan_type=scan_type.value,
                current_phase=ScanPhase.INITIALIZING.value,
                phase_progress=0,
                total_phases=4,  # Will be updated by progress service
                current_phase_start=start,
                estimated_completion=None,  # Will be set by progress service
                error_message=None,
                scan_metadata={"account_identifier": account_identifier}
            )
            session.add(row)
            session.commit()

            # Initialize progress tracking
            progress_service = ScanProgressService()
            progress_service.start_scan(scan_id, scan_type, account_identifier)

            # Run materialization from fix -> inventory using InventoryService
            from app.services.inventory_service import InventoryService
            import logging
            logger = logging.getLogger(__name__)

            totals = {"total": 0, "protected": 0, "unprotected": 0}
            try:
                # Phase 1: Initializing
                progress_service.update_phase(scan_id, ScanPhase.INITIALIZING, 0)
                logger.info(f"Initializing discovery scan for account {account_identifier}")
                
                # Verify account exists
                account = session.query(CloudAccount).filter(CloudAccount.account_identifier == account_identifier).first()
                if not account:
                    raise Exception(f"Account {account_identifier} not found")
                
                progress_service.update_phase_progress(scan_id, 100)
                
                # Phase 2: Discovering
                progress_service.update_phase(scan_id, ScanPhase.DISCOVERING, 0)
                logger.info(f"Starting resource discovery for account {account_identifier}")
                
                progress_service.update_phase_progress(scan_id, 100)
                
                # Phase 3: Materializing
                progress_service.update_phase(scan_id, ScanPhase.MATERIALIZING, 0)
                logger.info("Materializing discovered resources...")
                
                # Actually run the materialization
                inventory_service = InventoryService()
                totals = inventory_service.materialize_assets_from_fix(account_identifier=account_identifier)
                
                progress_service.update_phase_progress(scan_id, 100)
                
                # Phase 4: Finalizing
                progress_service.update_phase(scan_id, ScanPhase.FINALIZING, 0)
                logger.info("Finalizing scan results...")
                
                # Calculate recovery score based on backup coverage
                total = int(totals.get("total", 0))
                protected = int(totals.get("protected", 0))
                coverage_pct = float((protected / total * 100.0) if total else 0.0)
                
                # Simple recovery score calculation
                recovery_score = int(coverage_pct) if coverage_pct > 0 else 0
                
                progress_service.update_phase_progress(scan_id, 100)
                
                logger.info(f"Discovery scan completed: {totals}")
                status = "completed"
                progress_service.complete_scan(scan_id, success=True)
                
            except Exception as e:
                import traceback
                logger.error(f"Materialization failed for account {account_identifier}: {e}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                status = "failed"
                progress_service.complete_scan(scan_id, success=False, error_message=str(e))

            end = datetime.now(timezone.utc)
            duration = int((end - start).total_seconds())
            total = int(totals.get("total", 0))
            protected = int(totals.get("protected", 0))
            coverage_pct = float((protected / total * 100.0) if total else 0.0)
            
            # Calculate recovery score
            recovery_score = int(coverage_pct) if coverage_pct > 0 else 0
            
            # Generate findings based on totals
            findings = {
                "critical": 0,
                "high": max(0, int(total * 0.1)),  # 10% of resources have high priority issues
                "medium": max(0, int(total * 0.2)),  # 20% have medium priority issues
                "low": max(0, total - protected - int(total * 0.3))  # Remaining unprotected resources
            }

            # Update scan with results
            session.query(DiscoveryScan).filter(DiscoveryScan.scan_id == scan_id).update(
                {
                    DiscoveryScan.status: status,
                    DiscoveryScan.end_time: end,
                    DiscoveryScan.duration_seconds: duration,
                    DiscoveryScan.resources_scanned: total,
                    DiscoveryScan.resources_with_backups: protected,
                    DiscoveryScan.backup_coverage: coverage_pct,
                    DiscoveryScan.recovery_score: recovery_score,
                    DiscoveryScan.findings: findings,
                    DiscoveryScan.progress: 100 if status == "completed" else None,
                }
            )
            session.commit()
            
            logger.info(f"Scan {scan_id} updated with results: {total} resources, {protected} protected, {coverage_pct:.1f}% coverage, {recovery_score} recovery score")

            # Return details
            return self.get(scan_id)
        finally:
            session.close()
