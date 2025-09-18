from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter
from app.models.discovery import (
    ScanItem,
    ScanSummary,
    ScanListResponse,
    ScanDetailResponse,
    Findings,
)

router = APIRouter(prefix="/api/tenant/discovery/history", tags=["discovery-history"])


def _mock_scans() -> list[ScanItem]:
    base_image = "/placeholder.jpg"
    return [
        ScanItem(
            id="scan-001",
            account_name="Production Account",
            account_id="123456789012",
            type="full",
            status="completed",
            start_time="2024-01-08 14:30:00",
            end_time="2024-01-08 15:15:23",
            duration_seconds=45 * 60 + 23,
            resources_scanned=1247,
            resources_with_backups=1089,
            findings=Findings(critical=3, high=12, medium=28, low=156),
            recovery_score=87,
            backup_coverage=87.3,
            triggered_by="scheduled",
            region="us-east-1",
            attachment_url=base_image,
        ),
        ScanItem(
            id="scan-002",
            account_name="Staging Account",
            account_id="123456789013",
            type="incremental",
            status="running",
            start_time="2024-01-08 15:45:00",
            end_time=None,
            duration_seconds=12 * 60 + 45,
            resources_scanned=234,
            resources_with_backups=183,
            findings=Findings(critical=0, high=2, medium=8, low=23),
            recovery_score=78,
            backup_coverage=78.2,
            triggered_by="manual",
            region="us-west-2",
            progress=65,
            attachment_url=base_image,
        ),
        ScanItem(
            id="scan-003",
            account_name="Development Account",
            account_id="123456789014",
            type="compliance",
            status="failed",
            start_time="2024-01-08 10:15:00",
            end_time="2024-01-08 10:23:12",
            duration_seconds=8 * 60 + 12,
            resources_scanned=0,
            resources_with_backups=0,
            findings=Findings(critical=0, high=0, medium=0, low=0),
            recovery_score=0,
            backup_coverage=0.0,
            triggered_by="api",
            region="eu-west-1",
            attachment_url=base_image,
        ),
        ScanItem(
            id="scan-004",
            account_name="Production Account",
            account_id="123456789012",
            type="backup-validation",
            status="completed",
            start_time="2024-01-07 22:00:00",
            end_time="2024-01-07 23:12:45",
            duration_seconds=72 * 60 + 45,
            resources_scanned=1089,
            resources_with_backups=1089,
            findings=Findings(critical=0, high=1, medium=6, low=18),
            recovery_score=92,
            backup_coverage=100.0,
            triggered_by="scheduled",
            region="us-east-1",
            attachment_url=base_image,
        ),
        ScanItem(
            id="scan-005",
            account_name="Backup Account",
            account_id="123456789015",
            type="full",
            status="completed",
            start_time="2024-01-07 16:30:00",
            end_time="2024-01-07 17:23:45",
            duration_seconds=53 * 60 + 45,
            resources_scanned=456,
            resources_with_backups=306,
            findings=Findings(critical=1, high=4, medium=12, low=67),
            recovery_score=71,
            backup_coverage=67.1,
            triggered_by="manual",
            region="ap-southeast-1",
            attachment_url=base_image,
        ),
    ]


@router.get("", response_model=ScanListResponse)
def list_scans() -> ScanListResponse:
    from app.services.discovery_service import DiscoveryService

    return DiscoveryService().list()


@router.get("/{scan_id}", response_model=ScanDetailResponse)
def get_scan(scan_id: str) -> ScanDetailResponse:
    from app.services.discovery_service import DiscoveryService

    return DiscoveryService().get(scan_id)
