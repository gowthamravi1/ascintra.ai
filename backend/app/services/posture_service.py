from __future__ import annotations

from collections import defaultdict
from typing import Dict, List

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.db.session import get_session
from app.orm.models import AssetsInventory
from app.models.posture import (
    ScorecardResponse,
    OverallPosture,
    ServicePosture,
    RecoveryFramework,
    CriticalIssue,
    RecoveryMetrics,
)


class PostureService:
    """
    Produces the posture scorecard without depending on InventoryService.

    Data sources and formulas (documented for clarity):
    - Protection coverage and counts are computed from Arango `fix` collection using an AQL
      pattern that maps snapshots -> volumes and volumes -> instances:
        • Volume (EBS) is "protected" iff it has ≥1 snapshots.
        • Instance (EC2) is "protected" iff any attached volume is protected.
      This yields rows with fields: kind ∈ {EC2,EBS}, status ∈ {protected,unprotected}.

    - Per‑service metrics (for each service = kind):
        total_svc          = Σ resources(kind = svc)
        protected_svc      = Σ resources(kind = svc and status = 'protected')
        protection_rate(%) = protected_svc / max(total_svc,1) * 100
        service_score      = round(protection_rate)

    - Overall metrics:
        total_resources    = Σ total_svc
        overall_protected  = Σ protected_svc
        overall_score(%)   = round(overall_protected / max(total_resources,1) * 100)

    - Avg RTO / Avg RPO for services are intentionally left blank (None) until real timings
      are available from discovery/backup validations.

    - Recovery Framework Compliance, Critical Recovery Issues, and high‑level Recovery Metrics
      are populated to match the attached screenshot. These are placeholders designed so that
      future implementations can compute them from policy/test results.
    """

    def _compute_from_pg(self) -> Dict[str, Dict[str, int]]:
        session: Session = get_session()
        try:
            rows = session.execute(
                select(AssetsInventory.service, AssetsInventory.status, func.count())
                .group_by(AssetsInventory.service, AssetsInventory.status)
            ).all()
            agg: Dict[str, Dict[str, int]] = defaultdict(lambda: {"total": 0, "protected": 0})

            def norm_service(svc: str) -> str:
                s = (svc or "unknown").lower()
                mapping = {"ec2": "EC2", "ebs": "EBS", "rds": "RDS", "s3": "S3", "lambda": "LAMBDA"}
                return mapping.get(s, s.upper())

            for svc, status, cnt in rows:
                k = norm_service(svc)
                agg[k]["total"] += int(cnt)
                if str(status or "").lower() == "protected":
                    agg[k]["protected"] += int(cnt)
            return agg
        finally:
            session.close()

    def scorecard(self) -> ScorecardResponse:
        agg = self._compute_from_pg()

        total = sum(v["total"] for v in agg.values())
        protected_total = sum(v["protected"] for v in agg.values())
        overall_score = int(round((protected_total / total) * 100)) if total else 0

        services: List[ServicePosture] = []
        for svc in sorted(agg.keys()):
            t = agg[svc]["total"]
            p = agg[svc]["protected"]
            rate = (p / t * 100.0) if t else 0.0
            services.append(
                ServicePosture(
                    service=svc,
                    score=int(round(rate)),
                    protected=p,
                    total=t,
                    protection_rate=rate,
                    avg_rto=None,
                    avg_rpo=None,
                    critical_issues=None,
                )
            )

        # Compute framework compliance from live resource protection counts.
        # Formulas:
        #   passed_controls = Σ protected for relevant kinds
        #   total_controls  = Σ total for relevant kinds
        #   compliance(%)   = passed_controls / max(total_controls,1) * 100
        def framework_counts(kinds: List[str]) -> tuple[int, int, float]:
            t = sum(agg[k]["total"] for k in kinds if k in agg)
            p = sum(agg[k]["protected"] for k in kinds if k in agg)
            pct = (p / t * 100.0) if t else 0.0
            return p, t, pct

        dr_p, dr_t, dr_pct = framework_counts(["EC2", "EBS", "RDS", "S3"])
        bc_p, bc_t, bc_pct = framework_counts(["EC2", "RDS", "S3"])  # continuity focuses on compute+data services
        dp_p, dp_t, dp_pct = framework_counts(["EBS", "RDS", "S3"])   # data protection focuses on storage/db
        or_p, or_t, or_pct = framework_counts(["EC2", "EBS", "RDS", "S3"])

        frameworks = [
            RecoveryFramework(name="Disaster Recovery", compliance_percent=dr_pct, passed_controls=dr_p, total_controls=dr_t, rto="", rpo=""),
            RecoveryFramework(name="Business Continuity", compliance_percent=bc_pct, passed_controls=bc_p, total_controls=bc_t, rto="", rpo=""),
            RecoveryFramework(name="Data Protection", compliance_percent=dp_pct, passed_controls=dp_p, total_controls=dp_t, rto="", rpo=""),
            RecoveryFramework(name="Operational Resilience", compliance_percent=or_pct, passed_controls=or_p, total_controls=or_t, rto="", rpo=""),
        ]

        # Critical issues derived from live unprotected counts by service/kind.
        # count(kind) = total(kind) - protected(kind); titles/descriptions are canonical labels.
        def unprotected(kind: str) -> int:
            if kind not in agg:
                return 0
            return max(agg[kind]["total"] - agg[kind]["protected"], 0)

        issues = [
            CriticalIssue(service="EC2", title="Production instances without backup policies", description="Data loss risk during failures", count=unprotected("EC2"), rto="", rpo=""),
            CriticalIssue(service="S3", title="Cross-region replication not configured", description="Regional failure vulnerability", count=unprotected("S3"), rto="", rpo=""),
            CriticalIssue(service="RDS", title="Automated backups disabled", description="Database recovery impossible", count=unprotected("RDS"), rto="", rpo=""),
            CriticalIssue(service="EBS", title="Snapshot lifecycle policies missing", description="Inconsistent backup retention", count=unprotected("EBS"), rto="", rpo=""),
        ]

        # Metrics summary (placeholder values; formulas for future implementation):
        #   avg_rto, avg_rpo: could be computed as weighted means over recovery tests
        #   protection_coverage: overall_protected / total_resources * 100 (monthly window)
        #   recovery_tests: count over last 30 days
        # Keep summary metrics blank for now as requested.
        metrics = RecoveryMetrics(
            avg_rto="",
            avg_rpo="",
            protection_coverage=0.0,
            recovery_tests=0,
        )

        return ScorecardResponse(
            overall=OverallPosture(
                recovery_score=overall_score,
                protected=protected_total,
                unprotected=(total - protected_total),
                total=total,
            ),
            services=services,
            frameworks=frameworks,
            issues=issues,
            metrics=metrics,
        )
