from __future__ import annotations

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.navigation_service import NavigationService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/tenant/navigation/data")
async def get_navigation_data(account_identifier: str = None) -> Dict[str, Any]:
    """
    Get navigation data for the sidebar menu including:
    - Inventory counts and coverage
    - Recovery posture scores
    - Discovery status
    - Compliance metrics
    - Drift detection data
    - Recovery testing data
    """
    try:
        navigation_service = NavigationService()
        data = navigation_service.get_navigation_data(account_identifier)
        
        logger.info(f"Retrieved navigation data for account {account_identifier}")
        return {
            "success": True,
            "data": data
        }
        
    except Exception as e:
        logger.error(f"Failed to get navigation data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve navigation data: {str(e)}")


@router.get("/api/tenant/navigation/inventory")
async def get_inventory_navigation_data(account_identifier: str = None) -> Dict[str, Any]:
    """Get inventory-specific navigation data"""
    try:
        navigation_service = NavigationService()
        inventory_data = navigation_service._get_inventory_data(account_identifier)
        
        return {
            "success": True,
            "data": inventory_data
        }
        
    except Exception as e:
        logger.error(f"Failed to get inventory navigation data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve inventory data: {str(e)}")


@router.get("/api/tenant/navigation/recovery-posture")
async def get_recovery_posture_navigation_data(account_identifier: str = None) -> Dict[str, Any]:
    """Get recovery posture-specific navigation data"""
    try:
        navigation_service = NavigationService()
        posture_data = navigation_service._get_recovery_posture_data(account_identifier)
        
        return {
            "success": True,
            "data": posture_data
        }
        
    except Exception as e:
        logger.error(f"Failed to get recovery posture navigation data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve recovery posture data: {str(e)}")
