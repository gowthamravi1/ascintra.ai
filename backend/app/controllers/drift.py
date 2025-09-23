from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional, List
from app.db.arango import get_db
from app.orm.models import AssetsInventory, CloudAccount
from sqlalchemy.orm import Session
from app.db.session import get_session
import logging
from datetime import datetime, timezone
import json

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/tenant/drift/overview")
async def get_drift_overview(account_identifier: str = Query(None)) -> Dict[str, Any]:
    """Get drift overview data by comparing current fix collection with fix_node_history."""
    try:
        # Get all assets from PostgreSQL
        session: Session = get_session()
        try:
            query = session.query(AssetsInventory, CloudAccount).join(
                CloudAccount, CloudAccount.id == AssetsInventory.account_id
            )
            
            if account_identifier:
                query = query.filter(CloudAccount.account_identifier == account_identifier)
            
            assets = query.all()
            
            if not assets:
                return {
                    "summary": {
                        "totalResources": 0,
                        "driftingResources": 0,
                        "criticalDrift": 0,
                        "mediumDrift": 0,
                        "lowDrift": 0,
                        "lastScan": datetime.now(timezone.utc).isoformat(),
                        "nextScan": None
                    },
                    "items": []
                }
            
            # Get ArangoDB connection
            db = get_db()
            fix_collection = db.collection('fix')
            
            drifting_resources = []
            total_resources = len(assets)
            critical_count = 0
            medium_count = 0
            low_count = 0
            
            for asset, account in assets:
                try:
                    # Get current document from fix collection
                    current_doc = fix_collection.get(asset.arango_id)
                    if not current_doc:
                        continue
                    
                    # Get first historical document from fix_node_history
                    history_query = f"""
                    FOR doc IN fix_node_history
                    FILTER doc._key == @resource_key
                    SORT doc.created ASC
                    LIMIT 1
                    RETURN doc
                    """
                    
                    history_cursor = db.aql.execute(history_query, bind_vars={"resource_key": asset.arango_id.split('/')[-1]})
                    history_docs = list(history_cursor)
                    
                    if not history_docs:
                        continue
                    
                    historical_doc = history_docs[0]
                    
                    # Compare current vs historical
                    drift_changes = compare_documents(current_doc, historical_doc)
                    
                    if drift_changes:
                        severity = determine_severity(drift_changes, asset.kind)
                        drift_item = {
                            "id": f"drift-{asset.id}",
                            "asset_id": str(asset.id),
                            "resource_id": asset.resource_id,
                            "resource_name": asset.name or asset.resource_id,
                            "service": asset.service.upper() if asset.service else "UNKNOWN",
                            "region": asset.region or "unknown",
                            "provider": asset.provider.upper() if asset.provider else "UNKNOWN",
                            "severity": severity,
                            "issue": generate_issue_description(drift_changes),
                            "detected_at": datetime.now(timezone.utc).isoformat(),
                            "expected_config": generate_expected_config(historical_doc, drift_changes),
                            "current_config": generate_current_config(current_doc, drift_changes),
                            "impact": generate_impact_assessment(drift_changes, severity),
                            "tags": asset.tags or {},
                            "drift_changes": drift_changes
                        }
                        
                        drifting_resources.append(drift_item)
                        
                        # Count by severity
                        if severity == "High":
                            critical_count += 1
                        elif severity == "Medium":
                            medium_count += 1
                        else:
                            low_count += 1
                
                except Exception as e:
                    logger.warning(f"Failed to process drift for asset {asset.id}: {e}")
                    continue
            
            return {
                "summary": {
                    "totalResources": total_resources,
                    "driftingResources": len(drifting_resources),
                    "criticalDrift": critical_count,
                    "mediumDrift": medium_count,
                    "lowDrift": low_count,
                    "lastScan": datetime.now(timezone.utc).isoformat(),
                    "nextScan": None
                },
                "items": drifting_resources
            }
            
        finally:
            session.close()
            
    except Exception as e:
        logger.error(f"Failed to get drift overview: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve drift overview: {str(e)}")


@router.get("/api/tenant/drift/resource/{asset_id}")
async def get_resource_drift_details(asset_id: str, account_identifier: str = Query(None)) -> Dict[str, Any]:
    """Get detailed drift information for a specific resource."""
    try:
        # Get asset from PostgreSQL
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
            
            # Get ArangoDB documents
            db = get_db()
            fix_collection = db.collection('fix')
            
            # Get current document
            current_doc = fix_collection.get(asset.arango_id)
            if not current_doc:
                raise HTTPException(status_code=404, detail="Current asset document not found in ArangoDB")
            
            # Get historical documents
            history_query = f"""
            FOR doc IN fix_node_history
            FILTER doc._key == @resource_key
            SORT doc.created ASC
            LIMIT 5
            RETURN doc
            """
            
            history_cursor = db.aql.execute(history_query, bind_vars={"resource_key": asset.arango_id.split('/')[-1]})
            history_docs = list(history_cursor)
            
            if not history_docs:
                return {
                    "success": True,
                    "data": {
                        "asset_id": asset_id,
                        "resource_id": asset.resource_id,
                        "resource_name": asset.name or asset.resource_id,
                        "service": asset.service,
                        "region": asset.region,
                        "provider": asset.provider,
                        "has_drift": False,
                        "message": "No historical data available for comparison"
                    }
                }
            
            # Compare with first historical document
            first_historical = history_docs[0]
            drift_changes = compare_documents(current_doc, first_historical)
            
            # Generate detailed comparison
            detailed_comparison = generate_detailed_comparison(current_doc, first_historical, drift_changes)
            
            return {
                "success": True,
                "data": {
                    "asset_id": asset_id,
                    "resource_id": asset.resource_id,
                    "resource_name": asset.name or asset.resource_id,
                    "service": asset.service,
                    "region": asset.region,
                    "provider": asset.provider,
                    "has_drift": len(drift_changes) > 0,
                    "drift_changes": drift_changes,
                    "detailed_comparison": detailed_comparison,
                    "current_document": current_doc,
                    "historical_document": first_historical,
                    "history_timeline": [
                        {
                            "timestamp": doc.get('created', ''),
                            "changes": len(compare_documents(current_doc, doc)) if doc != first_historical else 0
                        }
                        for doc in history_docs
                    ]
                }
            }
            
        finally:
            session.close()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get resource drift details for {asset_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve resource drift details: {str(e)}")


def compare_documents(current: Dict[str, Any], historical: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Compare current and historical documents to find changes."""
    changes = []
    
    # Compare reported section (most important for configuration drift)
    current_reported = current.get('reported', {})
    historical_reported = historical.get('reported', {})
    
    # Get all keys from both documents
    all_keys = set(current_reported.keys()) | set(historical_reported.keys())
    
    for key in all_keys:
        current_value = current_reported.get(key)
        historical_value = historical_reported.get(key)
        
        if current_value != historical_value:
            changes.append({
                "field": key,
                "current_value": current_value,
                "historical_value": historical_value,
                "change_type": determine_change_type(current_value, historical_value)
            })
    
    return changes


def determine_change_type(current, historical) -> str:
    """Determine the type of change."""
    if current is None and historical is not None:
        return "removed"
    elif current is not None and historical is None:
        return "added"
    elif isinstance(current, dict) and isinstance(historical, dict):
        return "modified"
    elif isinstance(current, list) and isinstance(historical, list):
        return "list_modified"
    else:
        return "value_changed"


def determine_severity(changes: List[Dict[str, Any]], resource_kind: str) -> str:
    """Determine severity based on the type of changes."""
    high_risk_fields = [
        'instance_security_groups', 'security_groups', 'encryption', 'encrypted',
        'backup_retention', 'public_access', 'access_logging', 'versioning',
        'lifecycle_rules', 'cors_rules', 'bucket_policy', 'acl'
    ]
    
    medium_risk_fields = [
        'instance_type', 'volume_type', 'storage_class', 'performance_mode',
        'monitoring', 'logging', 'metrics', 'alarms'
    ]
    
    for change in changes:
        field = change['field'].lower()
        if any(high_field in field for high_field in high_risk_fields):
            return "High"
        elif any(medium_field in field for medium_field in medium_risk_fields):
            return "Medium"
    
    return "Low"


def generate_issue_description(changes: List[Dict[str, Any]]) -> str:
    """Generate a human-readable issue description."""
    if not changes:
        return "No configuration changes detected"
    
    if len(changes) == 1:
        change = changes[0]
        return f"{change['field']} {change['change_type']}"
    
    return f"{len(changes)} configuration fields modified"


def generate_expected_config(historical_doc: Dict[str, Any], changes: List[Dict[str, Any]]) -> str:
    """Generate expected configuration string."""
    if not changes:
        return "No changes detected"
    
    config_parts = []
    for change in changes[:3]:  # Limit to first 3 changes
        field = change['field']
        value = change['historical_value']
        config_parts.append(f"{field}: {format_value(value)}")
    
    if len(changes) > 3:
        config_parts.append(f"... and {len(changes) - 3} more changes")
    
    return "; ".join(config_parts)


def generate_current_config(current_doc: Dict[str, Any], changes: List[Dict[str, Any]]) -> str:
    """Generate current configuration string."""
    if not changes:
        return "No changes detected"
    
    config_parts = []
    for change in changes[:3]:  # Limit to first 3 changes
        field = change['field']
        value = change['current_value']
        config_parts.append(f"{field}: {format_value(value)}")
    
    if len(changes) > 3:
        config_parts.append(f"... and {len(changes) - 3} more changes")
    
    return "; ".join(config_parts)


def generate_impact_assessment(changes: List[Dict[str, Any]], severity: str) -> str:
    """Generate impact assessment based on changes and severity."""
    if severity == "High":
        return "Critical security or compliance impact - immediate attention required"
    elif severity == "Medium":
        return "Moderate operational impact - review recommended"
    else:
        return "Low impact - monitor for trends"


def generate_detailed_comparison(current: Dict[str, Any], historical: Dict[str, Any], changes: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate detailed comparison for the drift details view."""
    return {
        "summary": {
            "total_changes": len(changes),
            "high_risk_changes": len([c for c in changes if determine_severity([c], "") == "High"]),
            "medium_risk_changes": len([c for c in changes if determine_severity([c], "") == "Medium"]),
            "low_risk_changes": len([c for c in changes if determine_severity([c], "") == "Low"])
        },
        "changes": changes,
        "metadata": {
            "current_created": current.get('created', ''),
            "current_updated": current.get('updated', ''),
            "historical_created": historical.get('created', ''),
            "historical_updated": historical.get('updated', ''),
            "comparison_timestamp": datetime.now(timezone.utc).isoformat()
        }
    }


def format_value(value) -> str:
    """Format a value for display."""
    if value is None:
        return "null"
    elif isinstance(value, (dict, list)):
        return json.dumps(value, indent=2)[:100] + "..." if len(str(value)) > 100 else json.dumps(value, indent=2)
    else:
        return str(value)[:100] + "..." if len(str(value)) > 100 else str(value)
