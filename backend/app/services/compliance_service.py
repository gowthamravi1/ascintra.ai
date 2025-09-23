from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from collections import defaultdict

from sqlalchemy import select, func, desc
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.db.arango import get_db
from app.models.compliance import (
    ComplianceFramework,
    ComplianceRule,
    ComplianceRuleCreate,
    ComplianceRuleUpdate,
    ComplianceEvaluation,
    ComplianceEvaluationCreate,
    ComplianceRuleResult,
    ComplianceRuleResultCreate,
    ComplianceScoreResponse,
    ComplianceEvaluationRequest,
    ComplianceEvaluationResponse,
    ComplianceRuleEvaluationRequest,
    ComplianceRuleEvaluationResponse,
    ComplianceFrameworkSummary,
    ComplianceDashboardData,
)
from app.orm.models import (
    ComplianceFramework as ComplianceFrameworkORM,
    ComplianceRule as ComplianceRuleORM,
    ComplianceEvaluation as ComplianceEvaluationORM,
    ComplianceRuleResult as ComplianceRuleResultORM,
    AssetsInventory,
    CloudAccount,
)

logger = logging.getLogger(__name__)


class ComplianceService:
    def __init__(self):
        self.session: Session = get_session()

    def get_frameworks(self) -> List[ComplianceFramework]:
        """Get all compliance frameworks"""
        try:
            rows = self.session.execute(
                select(ComplianceFrameworkORM).order_by(ComplianceFrameworkORM.name)
            ).all()
            frameworks = []
            for row in rows:
                fw = row[0]
                fw.id = str(fw.id)
                frameworks.append(ComplianceFramework.model_validate(fw, from_attributes=True))
            return frameworks
        except Exception as e:
            logger.error(f"Error fetching compliance frameworks: {e}")
            return []
        finally:
            self.session.close()

    def get_framework(self, framework_id: str) -> Optional[ComplianceFramework]:
        """Get a specific compliance framework"""
        try:
            result = self.session.execute(
                select(ComplianceFrameworkORM).filter(ComplianceFrameworkORM.id == framework_id)
            ).first()
            if result:
                fw = result[0]
                fw.id = str(fw.id)
                return ComplianceFramework.model_validate(fw, from_attributes=True)
            return None
        except Exception as e:
            logger.error(f"Error fetching compliance framework {framework_id}: {e}")
            return None
        finally:
            self.session.close()

    def get_rules(self, framework_id: Optional[str] = None) -> List[ComplianceRule]:
        """Get compliance rules, optionally filtered by framework"""
        try:
            query = select(ComplianceRuleORM)
            if framework_id:
                query = query.filter(ComplianceRuleORM.framework_id == framework_id)
            
            rows = self.session.execute(query.order_by(ComplianceRuleORM.category, ComplianceRuleORM.rule_id)).all()
            rules = []
            for row in rows:
                rule = row[0]
                rule.id = str(rule.id)
                rule.framework_id = str(rule.framework_id)
                rules.append(ComplianceRule.model_validate(rule, from_attributes=True))
            return rules
        except Exception as e:
            logger.error(f"Error fetching compliance rules: {e}")
            return []
        finally:
            self.session.close()

    def create_rule(self, rule_data: ComplianceRuleCreate) -> Optional[ComplianceRule]:
        """Create a new compliance rule"""
        try:
            rule = ComplianceRuleORM(
                framework_id=rule_data.framework_id,
                rule_id=rule_data.rule_id,
                category=rule_data.category,
                description=rule_data.description,
                resource_type=rule_data.resource_type,
                field_path=rule_data.field_path,
                operator=rule_data.operator,
                expected_value=rule_data.expected_value,
                severity=rule_data.severity,
                remediation=rule_data.remediation,
                enabled=rule_data.enabled,
            )
            self.session.add(rule)
            self.session.commit()
            self.session.refresh(rule)
            rule.id = str(rule.id)
            rule.framework_id = str(rule.framework_id)
            return ComplianceRule.model_validate(rule, from_attributes=True)
        except Exception as e:
            logger.error(f"Error creating compliance rule: {e}")
            self.session.rollback()
            return None
        finally:
            self.session.close()

    def update_rule(self, rule_id: str, rule_data: ComplianceRuleUpdate) -> Optional[ComplianceRule]:
        """Update an existing compliance rule"""
        try:
            rule = self.session.get(ComplianceRuleORM, rule_id)
            if not rule:
                return None

            for field, value in rule_data.model_dump(exclude_unset=True).items():
                setattr(rule, field, value)

            self.session.commit()
            self.session.refresh(rule)
            rule.id = str(rule.id)
            rule.framework_id = str(rule.framework_id)
            return ComplianceRule.model_validate(rule, from_attributes=True)
        except Exception as e:
            logger.error(f"Error updating compliance rule {rule_id}: {e}")
            self.session.rollback()
            return None
        finally:
            self.session.close()

    def delete_rule(self, rule_id: str) -> bool:
        """Delete a compliance rule"""
        try:
            rule = self.session.get(ComplianceRuleORM, rule_id)
            if not rule:
                return False

            self.session.delete(rule)
            self.session.commit()
            return True
        except Exception as e:
            logger.error(f"Error deleting compliance rule {rule_id}: {e}")
            self.session.rollback()
            return False
        finally:
            self.session.close()

    def get_nested_field(self, data: Dict[str, Any], field_path: str) -> Any:
        """Get a nested field value from a dictionary using dot notation"""
        try:
            keys = field_path.split('.')
            value = data
            for key in keys:
                if isinstance(value, dict) and key in value:
                    value = value[key]
                else:
                    return None
            return value
        except Exception:
            return None

    def evaluate_rule(self, rule: ComplianceRuleORM, resources: List[Dict[str, Any]]) -> Tuple[bool, List[Dict[str, Any]]]:
        """Evaluate a single rule against a list of resources"""
        try:
            failed_resources = []
            
            for resource in resources:
                # Check if resource type matches
                if rule.resource_type != "any" and resource.get("type") != rule.resource_type:
                    continue

                # Get the actual value from the resource
                actual_value = self.get_nested_field(resource, rule.field_path)
                
                # Evaluate based on operator
                passed = self._evaluate_condition(actual_value, rule.operator, rule.expected_value)
                
                if not passed:
                    failed_resources.append({
                        "resource_id": resource.get("id"),
                        "resource_name": resource.get("name"),
                        "resource_type": resource.get("type"),
                        "actual_value": actual_value,
                        "expected_value": rule.expected_value,
                        "field_path": rule.field_path,
                    })

            return len(failed_resources) == 0, failed_resources
        except Exception as e:
            logger.error(f"Error evaluating rule {rule.rule_id}: {e}")
            return False, []

    def _evaluate_condition(self, actual_value: Any, operator: str, expected_value: Any) -> bool:
        """Evaluate a condition based on operator and expected value"""
        try:
            if operator == "equals":
                return actual_value == expected_value
            elif operator == "not_equals":
                return actual_value != expected_value
            elif operator == "contains":
                return expected_value in str(actual_value) if actual_value else False
            elif operator == "not_contains":
                return expected_value not in str(actual_value) if actual_value else False
            elif operator == "greater_than":
                return float(actual_value) > float(expected_value) if actual_value is not None else False
            elif operator == "less_than":
                return float(actual_value) < float(expected_value) if actual_value is not None else False
            elif operator == "is_true":
                return bool(actual_value) is True
            elif operator == "is_false":
                return bool(actual_value) is False
            elif operator == "is_null":
                return actual_value is None
            elif operator == "is_not_null":
                return actual_value is not None
            else:
                logger.warning(f"Unknown operator: {operator}")
                return False
        except Exception as e:
            logger.error(f"Error evaluating condition: {e}")
            return False

    def get_inventory_resources(self, account_id: str) -> List[Dict[str, Any]]:
        """Get inventory resources for compliance evaluation"""
        try:
            # Get assets from PostgreSQL
            assets = self.session.execute(
                select(AssetsInventory, CloudAccount.provider)
                .join(CloudAccount, CloudAccount.id == AssetsInventory.account_id)
                .filter(AssetsInventory.account_id == account_id)
            ).all()

            resources = []
            db = get_db()

            for asset, provider in assets:
                # Get the raw ArangoDB document
                # arango_id contains the full document ID, extract the key part
                arango_key = asset.arango_id.split('/')[-1] if '/' in asset.arango_id else asset.arango_id
                arango_doc = db.collection('fix').get(arango_key)
                if arango_doc:
                    resource = {
                        "id": str(asset.id),
                        "resource_id": asset.resource_id,
                        "name": asset.name,
                        "type": asset.kind,
                        "provider": provider,
                        "region": asset.region,
                        "tags": asset.tags or {},
                        "reported": arango_doc.get("reported", {}),
                    }
                    resources.append(resource)

            return resources
        except Exception as e:
            logger.error(f"Error fetching inventory resources: {e}")
            return []

    def evaluate_compliance(self, request: ComplianceEvaluationRequest) -> ComplianceEvaluationResponse:
        """Evaluate compliance for an account"""
        try:
            # Get frameworks to evaluate
            if request.framework_id:
                frameworks = [self.get_framework(request.framework_id)]
            else:
                frameworks = self.get_frameworks()

            frameworks = [f for f in frameworks if f and f.enabled]

            if not frameworks:
                return ComplianceEvaluationResponse(
                    success=False,
                    evaluation_id="",
                    compliance_score=0.0,
                    total_rules=0,
                    passed_rules=0,
                    failed_rules=0,
                    message="No enabled frameworks found"
                )

            # Get inventory resources
            resources = self.get_inventory_resources(request.account_id)
            if not resources:
                return ComplianceEvaluationResponse(
                    success=False,
                    evaluation_id="",
                    compliance_score=0.0,
                    total_rules=0,
                    passed_rules=0,
                    failed_rules=0,
                    message="No resources found for evaluation"
                )

            total_rules = 0
            total_passed = 0
            total_failed = 0
            evaluation_results = []

            for framework in frameworks:
                # Get rules for this framework
                rules = self.get_rules(framework.id)
                enabled_rules = [r for r in rules if r.enabled]

                framework_passed = 0
                framework_failed = 0

                for rule in enabled_rules:
                    total_rules += 1
                    passed, failed_resources = self.evaluate_rule(rule, resources)
                    
                    if passed:
                        total_passed += 1
                        framework_passed += 1
                    else:
                        total_failed += 1
                        framework_failed += 1

                    evaluation_results.append({
                        "rule_id": rule.rule_id,
                        "passed": passed,
                        "failed_resources": failed_resources,
                    })

            # Calculate overall compliance score
            compliance_score = (total_passed / total_rules * 100) if total_rules > 0 else 0.0

            # Create evaluation record
            evaluation = ComplianceEvaluationORM(
                account_id=request.account_id,
                framework_id=frameworks[0].id,  # Use first framework for now
                total_rules=total_rules,
                passed_rules=total_passed,
                failed_rules=total_failed,
                compliance_score=compliance_score,
                evaluation_data={"results": evaluation_results}
            )

            self.session.add(evaluation)
            self.session.commit()
            self.session.refresh(evaluation)

            return ComplianceEvaluationResponse(
                success=True,
                evaluation_id=str(evaluation.id),
                compliance_score=compliance_score,
                total_rules=total_rules,
                passed_rules=total_passed,
                failed_rules=total_failed,
                message="Compliance evaluation completed successfully"
            )

        except Exception as e:
            logger.error(f"Error evaluating compliance: {e}")
            self.session.rollback()
            return ComplianceEvaluationResponse(
                success=False,
                evaluation_id="",
                compliance_score=0.0,
                total_rules=0,
                passed_rules=0,
                failed_rules=0,
                message=f"Error during evaluation: {str(e)}"
            )
        finally:
            self.session.close()

    def get_compliance_scores(self, account_id: str) -> List[ComplianceScoreResponse]:
        """Get compliance scores for an account"""
        try:
            # Get latest evaluations for each framework
            evaluations = self.session.execute(
                select(ComplianceEvaluationORM, ComplianceFrameworkORM)
                .join(ComplianceFrameworkORM, ComplianceFrameworkORM.id == ComplianceEvaluationORM.framework_id)
                .filter(ComplianceEvaluationORM.account_id == account_id)
                .order_by(ComplianceEvaluationORM.evaluation_date.desc())
            ).all()

            # Group by framework and get latest
            framework_evaluations = {}
            for evaluation, framework in evaluations:
                if framework.id not in framework_evaluations:
                    framework_evaluations[framework.id] = {
                        "evaluation": evaluation,
                        "framework": framework
                    }

            scores = []
            for framework_id, data in framework_evaluations.items():
                evaluation = data["evaluation"]
                framework = data["framework"]

                # Calculate category breakdown
                categories = defaultdict(lambda: {"total": 0, "passed": 0, "failed": 0})
                
                # Get rule results for this evaluation
                rule_results = self.session.execute(
                    select(ComplianceRuleResultORM, ComplianceRuleORM)
                    .join(ComplianceRuleORM, ComplianceRuleORM.id == ComplianceRuleResultORM.rule_id)
                    .filter(ComplianceRuleResultORM.evaluation_id == evaluation.id)
                ).all()

                for rule_result, rule in rule_results:
                    categories[rule.category]["total"] += 1
                    if rule_result.passed:
                        categories[rule.category]["passed"] += 1
                    else:
                        categories[rule.category]["failed"] += 1

                # Calculate category scores
                category_scores = {}
                for category, stats in categories.items():
                    if stats["total"] > 0:
                        category_scores[category] = {
                            "score": (stats["passed"] / stats["total"]) * 100,
                            "total": stats["total"],
                            "passed": stats["passed"],
                            "failed": stats["failed"]
                        }

                scores.append(ComplianceScoreResponse(
                    framework_id=str(framework.id),
                    framework_name=framework.name,
                    compliance_score=evaluation.compliance_score,
                    total_rules=evaluation.total_rules,
                    passed_rules=evaluation.passed_rules,
                    failed_rules=evaluation.failed_rules,
                    evaluation_date=evaluation.evaluation_date,
                    categories=category_scores
                ))

            return scores

        except Exception as e:
            logger.error(f"Error fetching compliance scores: {e}")
            return []
        finally:
            self.session.close()

    def get_dashboard_data(self, account_id: str) -> ComplianceDashboardData:
        """Get compliance dashboard data"""
        try:
            # Get frameworks summary
            frameworks = self.get_frameworks()
            framework_summaries = []

            for framework in frameworks:
                # Get rule counts
                rule_count = self.session.execute(
                    select(func.count(ComplianceRuleORM.id))
                    .filter(ComplianceRuleORM.framework_id == framework.id)
                ).scalar() or 0

                enabled_rule_count = self.session.execute(
                    select(func.count(ComplianceRuleORM.id))
                    .filter(ComplianceRuleORM.framework_id == framework.id)
                    .filter(ComplianceRuleORM.enabled == True)
                ).scalar() or 0

                # Get latest evaluation
                latest_evaluation = self.session.execute(
                    select(ComplianceEvaluationORM)
                    .filter(ComplianceEvaluationORM.account_id == account_id)
                    .filter(ComplianceEvaluationORM.framework_id == framework.id)
                    .order_by(ComplianceEvaluationORM.evaluation_date.desc())
                    .limit(1)
                ).first()

                last_evaluation = latest_evaluation[0].evaluation_date if latest_evaluation else None
                average_score = latest_evaluation[0].compliance_score if latest_evaluation else None

                framework_summaries.append(ComplianceFrameworkSummary(
                    id=str(framework.id),
                    name=framework.name,
                    version=framework.version,
                    total_rules=rule_count,
                    enabled_rules=enabled_rule_count,
                    last_evaluation=last_evaluation,
                    average_score=average_score
                ))

            # Get recent evaluations
            recent_evaluations = self.session.execute(
                select(ComplianceEvaluationORM, ComplianceFrameworkORM)
                .join(ComplianceFrameworkORM, ComplianceFrameworkORM.id == ComplianceEvaluationORM.framework_id)
                .filter(ComplianceEvaluationORM.account_id == account_id)
                .order_by(ComplianceEvaluationORM.evaluation_date.desc())
                .limit(10)
            ).all()

            recent_eval_list = []
            for evaluation, framework in recent_evaluations:
                recent_eval_list.append(ComplianceEvaluation(
                    id=str(evaluation.id),
                    account_id=str(evaluation.account_id),
                    framework_id=str(evaluation.framework_id),
                    evaluation_date=evaluation.evaluation_date,
                    total_rules=evaluation.total_rules,
                    passed_rules=evaluation.passed_rules,
                    failed_rules=evaluation.failed_rules,
                    compliance_score=evaluation.compliance_score,
                    evaluation_data=evaluation.evaluation_data,
                    created_at=evaluation.created_at
                ))

            # Calculate overall metrics
            overall_score = 0.0
            critical_issues = 0
            total_resources = 0

            if recent_eval_list:
                overall_score = sum(eval.compliance_score for eval in recent_eval_list) / len(recent_eval_list)
                critical_issues = sum(eval.failed_rules for eval in recent_eval_list)
                total_resources = sum(eval.total_rules for eval in recent_eval_list)

            return ComplianceDashboardData(
                frameworks=framework_summaries,
                recent_evaluations=recent_eval_list,
                overall_score=overall_score,
                critical_issues=critical_issues,
                total_resources_evaluated=total_resources
            )

        except Exception as e:
            logger.error(f"Error fetching dashboard data: {e}")
            return ComplianceDashboardData(
                frameworks=[],
                recent_evaluations=[],
                overall_score=0.0,
                critical_issues=0,
                total_resources_evaluated=0
            )
        finally:
            self.session.close()
