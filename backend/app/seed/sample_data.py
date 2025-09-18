from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.db.session import get_session
from app.orm.models import CloudAccount, DiscoveryScan


def _ensure_account(session: Session, provider: str, account_identifier: str, name: str, region: str) -> CloudAccount:
    acct = (
        session.query(CloudAccount)
        .filter(CloudAccount.provider == provider, CloudAccount.account_identifier == account_identifier)
        .one_or_none()
    )
    if acct:
        return acct
    acct = CloudAccount(
        provider=provider,
        account_identifier=account_identifier,
        name=name,
        primary_region=region,
        discovery_enabled=True,
        discovery_options={"ec2": True, "rds": True, "s3": True, "ebs": True},
        connection_status="connected",
    )
    session.add(acct)
    session.commit()
    session.refresh(acct)
    return acct


def seed() -> None:
    session: Session = get_session()
    try:
        # Accounts
        prod = _ensure_account(session, "aws", "123456789012", "Production Account", "us-east-1")
        stag = _ensure_account(session, "aws", "123456789013", "Staging Account", "us-west-2")
        dev = _ensure_account(session, "aws", "123456789014", "Development Account", "eu-west-1")
        bkp = _ensure_account(session, "aws", "123456789015", "Backup Account", "ap-southeast-1")

        now = datetime.now(timezone.utc)

        scans = [
            dict(
                scan_id="scan-001",
                account=prod,
                type="full",
                status="completed",
                start=now - timedelta(days=1, hours=2),
                duration=45 * 60 + 23,
                resources_scanned=1247,
                resources_with_backups=1089,
                findings=dict(critical=3, high=12, medium=28, low=156),
                recovery_score=87,
                backup_coverage=87.3,
                triggered_by="scheduled",
                region="us-east-1",
                progress=None,
            ),
            dict(
                scan_id="scan-002",
                account=stag,
                type="incremental",
                status="running",
                start=now - timedelta(hours=1),
                duration=12 * 60 + 45,
                resources_scanned=234,
                resources_with_backups=183,
                findings=dict(critical=0, high=2, medium=8, low=23),
                recovery_score=78,
                backup_coverage=78.2,
                triggered_by="manual",
                region="us-west-2",
                progress=65,
            ),
            dict(
                scan_id="scan-003",
                account=dev,
                type="compliance",
                status="failed",
                start=now - timedelta(days=1, hours=5),
                duration=8 * 60 + 12,
                resources_scanned=0,
                resources_with_backups=0,
                findings=dict(critical=0, high=0, medium=0, low=0),
                recovery_score=0,
                backup_coverage=0.0,
                triggered_by="api",
                region="eu-west-1",
                progress=None,
            ),
            dict(
                scan_id="scan-004",
                account=prod,
                type="backup-validation",
                status="completed",
                start=now - timedelta(days=2, hours=3),
                duration=72 * 60 + 45,
                resources_scanned=1089,
                resources_with_backups=1089,
                findings=dict(critical=0, high=1, medium=6, low=18),
                recovery_score=92,
                backup_coverage=100.0,
                triggered_by="scheduled",
                region="us-east-1",
                progress=None,
            ),
            dict(
                scan_id="scan-005",
                account=bkp,
                type="full",
                status="completed",
                start=now - timedelta(days=2, hours=6),
                duration=53 * 60 + 45,
                resources_scanned=456,
                resources_with_backups=306,
                findings=dict(critical=1, high=4, medium=12, low=67),
                recovery_score=71,
                backup_coverage=67.1,
                triggered_by="manual",
                region="ap-southeast-1",
                progress=None,
            ),
        ]

        for s in scans:
            # Upsert by scan_id
            existing = (
                session.query(DiscoveryScan).filter(DiscoveryScan.scan_id == s["scan_id"]).one_or_none()
            )
            if existing:
                continue
            end_time = s["start"] + timedelta(seconds=s["duration"]) if s["status"] == "completed" else None
            row = DiscoveryScan(
                scan_id=s["scan_id"],
                account_id=s["account"].id,
                type=s["type"],
                status=s["status"],
                start_time=s["start"],
                end_time=end_time,
                duration_seconds=s["duration"],
                resources_scanned=s["resources_scanned"],
                resources_with_backups=s["resources_with_backups"],
                findings=s["findings"],
                recovery_score=s["recovery_score"],
                backup_coverage=s["backup_coverage"],
                triggered_by=s["triggered_by"],
                region=s["region"],
                progress=s["progress"],
            )
            session.add(row)

        session.commit()
        print("Seeded sample accounts and discovery scans.")
    finally:
        session.close()


if __name__ == "__main__":
    seed()

