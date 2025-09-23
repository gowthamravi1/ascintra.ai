from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.models.compliance import (
    ComplianceFramework,
    ComplianceRule,
    ComplianceRuleCreate,
    ComplianceRuleUpdate,
    ComplianceEvaluation,
    ComplianceEvaluationRequest,
    ComplianceEvaluationResponse,
    ComplianceScoreResponse,
    ComplianceDashboardData,
)
from app.services.compliance_service import ComplianceService

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


@router.get("/frameworks", response_model=List[ComplianceFramework])
def get_frameworks():
    """Get all compliance frameworks"""
    service = ComplianceService()
    return service.get_frameworks()


@router.get("/frameworks/{framework_id}", response_model=ComplianceFramework)
def get_framework(framework_id: str):
    """Get a specific compliance framework"""
    service = ComplianceService()
    framework = service.get_framework(framework_id)
    if not framework:
        raise HTTPException(status_code=404, detail="Framework not found")
    return framework


@router.get("/rules", response_model=List[ComplianceRule])
def get_rules(framework_id: Optional[str] = Query(None, description="Filter by framework ID")):
    """Get compliance rules, optionally filtered by framework"""
    service = ComplianceService()
    return service.get_rules(framework_id)


@router.post("/rules", response_model=ComplianceRule)
def create_rule(rule_data: ComplianceRuleCreate):
    """Create a new compliance rule"""
    service = ComplianceService()
    rule = service.create_rule(rule_data)
    if not rule:
        raise HTTPException(status_code=400, detail="Failed to create rule")
    return rule


@router.put("/rules/{rule_id}", response_model=ComplianceRule)
def update_rule(rule_id: str, rule_data: ComplianceRuleUpdate):
    """Update an existing compliance rule"""
    service = ComplianceService()
    rule = service.update_rule(rule_id, rule_data)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return rule


@router.delete("/rules/{rule_id}")
def delete_rule(rule_id: str):
    """Delete a compliance rule"""
    service = ComplianceService()
    success = service.delete_rule(rule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"message": "Rule deleted successfully"}


@router.post("/evaluate", response_model=ComplianceEvaluationResponse)
def evaluate_compliance(request: ComplianceEvaluationRequest):
    """Evaluate compliance for an account"""
    service = ComplianceService()
    return service.evaluate_compliance(request)


@router.get("/scores/{account_id}", response_model=List[ComplianceScoreResponse])
def get_compliance_scores(account_id: str):
    """Get compliance scores for an account"""
    service = ComplianceService()
    return service.get_compliance_scores(account_id)


@router.get("/dashboard/{account_id}", response_model=ComplianceDashboardData)
def get_dashboard_data(account_id: str):
    """Get compliance dashboard data for an account"""
    service = ComplianceService()
    return service.get_dashboard_data(account_id)


@router.post("/evaluate/rule")
def evaluate_single_rule(rule_id: str, resources: List[dict]):
    """Evaluate a single rule against provided resources (for testing)"""
    service = ComplianceService()
    
    # Get the rule
    rules = service.get_rules()
    rule = next((r for r in rules if r.rule_id == rule_id), None)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    # Convert to ORM object for evaluation
    from app.orm.models import ComplianceRule as ComplianceRuleORM
    rule_orm = ComplianceRuleORM(
        id=rule.id,
        framework_id=rule.framework_id,
        rule_id=rule.rule_id,
        category=rule.category,
        description=rule.description,
        resource_type=rule.resource_type,
        field_path=rule.field_path,
        operator=rule.operator,
        expected_value=rule.expected_value,
        severity=rule.severity,
        remediation=rule.remediation,
        enabled=rule.enabled,
    )
    
    passed, failed_resources = service.evaluate_rule(rule_orm, resources)
    
    return {
        "rule_id": rule_id,
        "passed": passed,
        "failed_resources": failed_resources,
        "total_resources": len(resources),
        "failed_count": len(failed_resources)
    }
