from __future__ import annotations

from fastapi import APIRouter
from app.models.posture import ScorecardResponse
from app.services.posture_service import PostureService


router = APIRouter(prefix="/api/tenant/posture/scorecard", tags=["posture-scorecard"])


@router.get("", response_model=ScorecardResponse)
def scorecard() -> ScorecardResponse:
    return PostureService().scorecard()
