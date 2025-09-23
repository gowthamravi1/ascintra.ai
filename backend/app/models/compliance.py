from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ComplianceFrameworkBase(BaseModel):
    name: str
    version: Optional[str] = None
    description: Optional[str] = None
    enabled: bool = True


class ComplianceFrameworkCreate(ComplianceFrameworkBase):
    pass


class ComplianceFramework(ComplianceFrameworkBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ComplianceRuleBase(BaseModel):
    rule_id: str
    category: str
    description: str
    resource_type: str
    field_path: str
    operator: str
    expected_value: Optional[Any] = None
    severity: str
    remediation: Optional[str] = None
    enabled: bool = True


class ComplianceRuleCreate(ComplianceRuleBase):
    framework_id: str


class ComplianceRuleUpdate(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    resource_type: Optional[str] = None
    field_path: Optional[str] = None
    operator: Optional[str] = None
    expected_value: Optional[Any] = None
    severity: Optional[str] = None
    remediation: Optional[str] = None
    enabled: Optional[bool] = None


class ComplianceRule(ComplianceRuleBase):
    id: str
    framework_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ComplianceRuleWithFramework(ComplianceRule):
    framework: ComplianceFramework


class ComplianceEvaluationBase(BaseModel):
    account_id: str
    framework_id: str
    total_rules: int
    passed_rules: int
    failed_rules: int
    compliance_score: float
    evaluation_data: Dict[str, Any] = {}


class ComplianceEvaluationCreate(ComplianceEvaluationBase):
    pass


class ComplianceEvaluation(ComplianceEvaluationBase):
    id: str
    evaluation_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class ComplianceRuleResultBase(BaseModel):
    rule_id: str
    passed: bool
    failed_resources: List[Dict[str, Any]] = []
    error_message: Optional[str] = None


class ComplianceRuleResultCreate(ComplianceRuleResultBase):
    evaluation_id: str


class ComplianceRuleResult(ComplianceRuleResultBase):
    id: str
    evaluation_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ComplianceRuleResultWithDetails(ComplianceRuleResult):
    rule: ComplianceRule


class ComplianceEvaluationWithDetails(ComplianceEvaluation):
    framework: ComplianceFramework
    rule_results: List[ComplianceRuleResultWithDetails] = []


class ComplianceScoreResponse(BaseModel):
    framework_id: str
    framework_name: str
    compliance_score: float
    total_rules: int
    passed_rules: int
    failed_rules: int
    evaluation_date: datetime
    categories: Dict[str, Dict[str, Any]] = {}


class ComplianceEvaluationRequest(BaseModel):
    account_id: str
    framework_id: Optional[str] = None
    force_evaluation: bool = False


class ComplianceEvaluationResponse(BaseModel):
    success: bool
    evaluation_id: str
    compliance_score: float
    total_rules: int
    passed_rules: int
    failed_rules: int
    message: str


class ComplianceRuleEvaluationRequest(BaseModel):
    rule_id: str
    resources: List[Dict[str, Any]]


class ComplianceRuleEvaluationResponse(BaseModel):
    rule_id: str
    passed: bool
    failed_resources: List[Dict[str, Any]] = []
    error_message: Optional[str] = None


class ComplianceFrameworkSummary(BaseModel):
    id: str
    name: str
    version: Optional[str]
    total_rules: int
    enabled_rules: int
    last_evaluation: Optional[datetime]
    average_score: Optional[float]


class ComplianceDashboardData(BaseModel):
    frameworks: List[ComplianceFrameworkSummary]
    recent_evaluations: List[ComplianceEvaluation]
    overall_score: float
    critical_issues: int
    total_resources_evaluated: int
