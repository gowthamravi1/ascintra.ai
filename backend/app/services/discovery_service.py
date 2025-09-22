from __future__ import annotations

from typing import List
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.orm.models import DiscoveryScan, CloudAccount
from app.models.discovery import ScanItem, Findings, ScanListResponse, ScanSummary, ScanDetailResponse
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
            )
            return ScanDetailResponse(**item.model_dump())
        finally:
            session.close()

    def run_scan_for_account_by_identifier(self, account_identifier: str, triggered_by: str = "manual") -> ScanDetailResponse:
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
            # Create running scan
            row = DiscoveryScan(
                scan_id=scan_id,
                account_id=acct.id,
                type="full",
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
            )
            session.add(row)
            session.commit()

            # Run materialization from fix -> inventory using InventoryService
            from app.services.inventory_service import InventoryService

            totals = {"total": 0, "protected": 0, "unprotected": 0}
            try:
                totals = InventoryService().materialize_assets_from_fix(account_identifier=account_identifier)
                status = "completed"
            except Exception:
                status = "failed"

            end = datetime.now(timezone.utc)
            duration = int((end - start).total_seconds())
            total = int(totals.get("total", 0))
            protected = int(totals.get("protected", 0))
            coverage_pct = float((protected / total * 100.0) if total else 0.0)

            # Update scan with results
            session.query(DiscoveryScan).filter(DiscoveryScan.scan_id == scan_id).update(
                {
                    DiscoveryScan.status: status,
                    DiscoveryScan.end_time: end,
                    DiscoveryScan.duration_seconds: duration,
                    DiscoveryScan.resources_scanned: total,
                    DiscoveryScan.resources_with_backups: protected,
                    DiscoveryScan.backup_coverage: coverage_pct,
                    DiscoveryScan.progress: 100 if status == "completed" else None,
                }
            )
            session.commit()

            # Return details
            return self.get(scan_id)
        finally:
            session.close()
