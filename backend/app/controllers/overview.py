from __future__ import annotations

from fastapi import APIRouter
from app.services.overview_service import OverviewService

router = APIRouter(prefix="/api/tenant/overview", tags=["overview"])


@router.get("/metrics")
def get_overview_metrics():
    """Get key metrics for the overview dashboard"""
    service = OverviewService()
    return service.get_overview_metrics()


@router.get("/trends")
def get_recovery_trends():
    """Get recovery posture trends over time"""
    service = OverviewService()
    return service.get_recovery_trends()


@router.get("/activities")
def get_recent_activities():
    """Get recent activities and events"""
    service = OverviewService()
    return service.get_recent_activities()


@router.get("/accounts")
def get_account_summary():
    """Get summary of connected accounts"""
    service = OverviewService()
    return service.get_account_summary()
