from __future__ import annotations

from fastapi import APIRouter

from app.services.drift_service import DriftService


router = APIRouter(prefix="/api/tenant/drift/overview", tags=["drift"])


@router.get("")
def get_drift_overview():
    return DriftService().overview()

