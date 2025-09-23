from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
from app.db.arango import get_db
from app.orm.models import AssetsInventory, CloudAccount
from sqlalchemy.orm import Session
from app.db.session import get_session
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/tenant/inventory/asset/{asset_id}")
async def get_asset_details(asset_id: str, account_identifier: str = Query(None)) -> Dict[str, Any]:
    """
    Get detailed asset information from ArangoDB by asset ID.
    
    Args:
        asset_id: The unique asset ID from the assets_inventory table
        account_identifier: Optional account identifier to filter by account
        
    Returns:
        Complete asset document from ArangoDB with metadata
    """
    try:
        # First, get the asset from PostgreSQL to get the source_id (ArangoDB _id)
        session: Session = get_session()
        try:
            # Build query to get asset with account info
            query = session.query(AssetsInventory, CloudAccount).join(
                CloudAccount, CloudAccount.id == AssetsInventory.account_id
            ).filter(AssetsInventory.id == asset_id)
            
            if account_identifier:
                query = query.filter(CloudAccount.account_identifier == account_identifier)
            
            result = query.first()
            
            if not result:
                raise HTTPException(status_code=404, detail="Asset not found")
            
            asset, account = result
            
            # Get the ArangoDB document using the arango_id
            db = get_db()
            arango_doc = db.collection('fix').get(asset.arango_id)
            
            if not arango_doc:
                raise HTTPException(status_code=404, detail="Asset document not found in ArangoDB")
            
            # Prepare the response with both PostgreSQL and ArangoDB data
            response = {
                "asset_id": asset_id,
                "arango_id": asset.arango_id,
                "account_info": {
                    "account_id": account.account_identifier,
                    "account_name": account.name,
                    "provider": account.provider,
                    "region": account.primary_region
                },
                "inventory_data": {
                    "service": asset.service,
                    "kind": asset.kind,
                    "resource_id": asset.resource_id,
                    "name": asset.name,
                    "provider": asset.provider,
                    "status": asset.status,
                    "region": asset.region,
                    "last_backup": asset.last_backup.isoformat() if asset.last_backup else None,
                    "tags": asset.tags or {},
                    "created_at": asset.created_at.isoformat(),
                    "updated_at": asset.updated_at.isoformat()
                },
                "arango_document": arango_doc,
                "metadata": {
                    "total_size": len(str(arango_doc)),
                    "document_keys": list(arango_doc.keys()) if isinstance(arango_doc, dict) else [],
                    "kinds": arango_doc.get('kinds', []) if isinstance(arango_doc, dict) else [],
                    "reported_fields": list(arango_doc.get('reported', {}).keys()) if isinstance(arango_doc, dict) and 'reported' in arango_doc else []
                }
            }
            
            logger.info(f"Retrieved asset details for {asset_id} from account {account.account_identifier}")
            return {
                "success": True,
                "data": response
            }
            
        finally:
            session.close()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get asset details for {asset_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve asset details: {str(e)}")


@router.get("/api/tenant/inventory/asset/{asset_id}/raw")
async def get_asset_raw_document(asset_id: str, account_identifier: str = Query(None)) -> Dict[str, Any]:
    """
    Get the raw ArangoDB document for an asset.
    
    Args:
        asset_id: The unique asset ID from the assets_inventory table
        account_identifier: Optional account identifier to filter by account
        
    Returns:
        Raw ArangoDB document
    """
    try:
        # Get the source_id from PostgreSQL
        session: Session = get_session()
        try:
            query = session.query(AssetsInventory, CloudAccount).join(
                CloudAccount, CloudAccount.id == AssetsInventory.account_id
            ).filter(AssetsInventory.id == asset_id)
            
            if account_identifier:
                query = query.filter(CloudAccount.account_identifier == account_identifier)
            
            result = query.first()
            
            if not result:
                raise HTTPException(status_code=404, detail="Asset not found")
            
            asset, account = result
            
            # Get the raw ArangoDB document
            db = get_db()
            arango_doc = db.collection('fix').get(asset.arango_id)
            
            if not arango_doc:
                raise HTTPException(status_code=404, detail="Asset document not found in ArangoDB")
            
            return {
                "success": True,
                "data": {
                    "asset_id": asset_id,
                    "arango_id": asset.arango_id,
                    "account_identifier": account.account_identifier,
                    "raw_document": arango_doc
                }
            }
            
        finally:
            session.close()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get raw asset document for {asset_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve raw asset document: {str(e)}")


@router.get("/api/tenant/inventory/asset/{asset_id}/summary")
async def get_asset_summary(asset_id: str, account_identifier: str = Query(None)) -> Dict[str, Any]:
    """
    Get a summary of asset information (PostgreSQL data only).
    
    Args:
        asset_id: The unique asset ID from the assets_inventory table
        account_identifier: Optional account identifier to filter by account
        
    Returns:
        Asset summary from PostgreSQL
    """
    try:
        session: Session = get_session()
        try:
            query = session.query(AssetsInventory, CloudAccount).join(
                CloudAccount, CloudAccount.id == AssetsInventory.account_id
            ).filter(AssetsInventory.id == asset_id)
            
            if account_identifier:
                query = query.filter(CloudAccount.account_identifier == account_identifier)
            
            result = query.first()
            
            if not result:
                raise HTTPException(status_code=404, detail="Asset not found")
            
            asset, account = result
            
            return {
                "success": True,
                "data": {
                    "asset_id": asset_id,
                    "account_info": {
                        "account_id": account.account_identifier,
                        "account_name": account.name,
                        "provider": account.provider
                    },
                    "asset_summary": {
                        "service": asset.service,
                        "kind": asset.kind,
                        "resource_id": asset.resource_id,
                        "name": asset.name,
                        "provider": asset.provider,
                        "status": asset.status,
                        "region": asset.region,
                        "last_backup": asset.last_backup.isoformat() if asset.last_backup else None,
                        "tags": asset.tags or {},
                        "created_at": asset.created_at.isoformat(),
                        "updated_at": asset.updated_at.isoformat()
                    }
                }
            }
            
        finally:
            session.close()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get asset summary for {asset_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve asset summary: {str(e)}")
