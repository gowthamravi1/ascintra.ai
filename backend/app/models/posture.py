from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel


class ServicePosture(BaseModel):
    service: str
    score: int
    protected: int
    total: int
    protection_rate: float
    avg_rto: Optional[str] = None
    avg_rpo: Optional[str] = None
    critical_issues: Optional[int] = None


class OverallPosture(BaseModel):
    recovery_score: int
    protected: int
    unprotected: int
    total: int


class RecoveryFramework(BaseModel):
    name: str
    compliance_percent: float
    passed_controls: int
    total_controls: int
    rto: str
    rpo: str

    # derived property can be computed client-side; included for convenience
    @property
    def failed_controls(self) -> int:
        return max(self.total_controls - self.passed_controls, 0)


class CriticalIssue(BaseModel):
    service: str
    title: str
    description: str
    count: int
    rto: str
    rpo: str


class RecoveryMetrics(BaseModel):
    avg_rto: str
    avg_rpo: str
    protection_coverage: float
    recovery_tests: int


class ScorecardResponse(BaseModel):
    overall: OverallPosture
    services: List[ServicePosture]
    frameworks: List[RecoveryFramework]
    issues: List[CriticalIssue]
    metrics: RecoveryMetrics
