from fastapi import APIRouter

from app.services.inventory_service import InventoryService


router = APIRouter(prefix="/api", tags=["inventory"])


@router.get("/tenant/inventory")
@router.get("/inventory")
def get_inventory_list():
    svc = InventoryService()
    return svc.list()


@router.get("/tenant/inventory/details")
@router.get("/inventory/details")
def get_inventory_details():
    svc = InventoryService()
    return svc.details()

