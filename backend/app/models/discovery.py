from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel


class Findings(BaseModel):
    critical: int
    high: int
    medium: int
    low: int


class ScanItem(BaseModel):
    id: str
    account_name: str
    account_id: str
    type: str  # full | incremental | compliance | backup-validation
    status: str  # completed | running | failed | cancelled
    start_time: str
    end_time: Optional[str] = None
    duration_seconds: int
    resources_scanned: int
    resources_with_backups: int
    findings: Findings
    recovery_score: int
    backup_coverage: float
    triggered_by: str  # scheduled | manual | api | webhook
    region: str
    progress: Optional[int] = None
    attachment_url: Optional[str] = None


class ScanSummary(BaseModel):
    total_scans: int
    success_rate: float  # 0..100
    avg_duration_seconds: float
    resources_scanned: int


class ScanListResponse(BaseModel):
    summary: ScanSummary
    scans: List[ScanItem]


class ScanDetailResponse(ScanItem):
    pass
