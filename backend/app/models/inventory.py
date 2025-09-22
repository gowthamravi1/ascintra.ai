from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class InventoryItem(BaseModel):
    id: str = Field(..., description="Document key or ID")
    name: str
    type: str
    status: str
    region: Optional[str] = None
    service: Optional[str] = None
    last_backup: Optional[str] = None
    tags: Dict[str, str] = {}
    account_id: Optional[str] = None


class InventorySummary(BaseModel):
    assets: int
    coverage: float


class InventoryListResponse(BaseModel):
    page: str = "tenant/inventory"
    title: str = "Tenant Inventory"
    mock: bool = False
    summary: InventorySummary
    items: List[InventoryItem]


class InventoryDetails(BaseModel):
    id: str
    description: Optional[str] = None
    configuration: Dict[str, Any] = {}
    metrics: Dict[str, Any] = {}


class InventoryDetailsResponse(BaseModel):
    page: str = "tenant/inventory/details"
    title: str = "Inventory Details"
    mock: bool = False
    details: List[InventoryDetails]
