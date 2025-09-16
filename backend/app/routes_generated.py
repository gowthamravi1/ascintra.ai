from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


def _payload(route: str):
    now = datetime.utcnow().isoformat() + "Z"
    page = route.lstrip("/") or "root"
    title = " ".join([p.capitalize() for p in page.split("/") if p]) or "Home"
    return {
        "page": page,
        "title": title,
        "mock": True,
        "data": {
            "message": f"Mock data for /{page if page != 'root' else ''}",
            "timestamp": now,
        },
    }


# Explicit endpoints generated from frontend/app/**/page.tsx
@router.get("/api")
def get_api_root():
    return _payload("/")

@router.get("/api/admin")
def get_api_admin():
    return _payload("/admin")

@router.get("/api/admin/audit")
def get_api_admin_audit():
    return _payload("/admin/audit")

@router.get("/api/admin/billing/invoices")
def get_api_admin_billing_invoices():
    return _payload("/admin/billing/invoices")

@router.get("/api/admin/billing/plans")
def get_api_admin_billing_plans():
    return _payload("/admin/billing/plans")

@router.get("/api/admin/billing/usage")
def get_api_admin_billing_usage():
    return _payload("/admin/billing/usage")

@router.get("/api/admin/dashboard")
def get_api_admin_dashboard():
    return _payload("/admin/dashboard")

@router.get("/api/admin/docs")
def get_api_admin_docs():
    return _payload("/admin/docs")

@router.get("/api/admin/integrations")
def get_api_admin_integrations():
    return _payload("/admin/integrations")

@router.get("/api/admin/roles")
def get_api_admin_roles():
    return _payload("/admin/roles")

@router.get("/api/admin/scim")
def get_api_admin_scim():
    return _payload("/admin/scim")

@router.get("/api/admin/service-ops")
def get_api_admin_service_ops():
    return _payload("/admin/service-ops")

@router.get("/api/admin/settings/features")
def get_api_admin_settings_features():
    return _payload("/admin/settings/features")

@router.get("/api/admin/settings/notifications")
def get_api_admin_settings_notifications():
    return _payload("/admin/settings/notifications")

@router.get("/api/admin/settings/smtp")
def get_api_admin_settings_smtp():
    return _payload("/admin/settings/smtp")

@router.get("/api/admin/status")
def get_api_admin_status():
    return _payload("/admin/status")

@router.get("/api/admin/support")
def get_api_admin_support():
    return _payload("/admin/support")

@router.get("/api/admin/tenants")
def get_api_admin_tenants():
    return _payload("/admin/tenants")

@router.get("/api/admin/tenants/provision")
def get_api_admin_tenants_provision():
    return _payload("/admin/tenants/provision")

@router.get("/api/admin/users")
def get_api_admin_users():
    return _payload("/admin/users")

@router.get("/api/audit")
def get_api_audit():
    return _payload("/audit")

@router.get("/api/billing/plans")
def get_api_billing_plans():
    return _payload("/billing/plans")

@router.get("/api/compliance")
def get_api_compliance():
    return _payload("/compliance")

@router.get("/api/dashboard")
def get_api_dashboard():
    return _payload("/dashboard")

@router.get("/api/discovery/connect")
def get_api_discovery_connect():
    return _payload("/discovery/connect")

@router.get("/api/discovery/history")
def get_api_discovery_history():
    return _payload("/discovery/history")

@router.get("/api/integrations")
def get_api_integrations():
    return _payload("/integrations")

# inventory endpoints handled by app.controllers.inventory

@router.get("/api/overview")
def get_api_overview():
    return _payload("/overview")

@router.get("/api/posture/scorecard")
def get_api_posture_scorecard():
    return _payload("/posture/scorecard")

@router.get("/api/posture/trends")
def get_api_posture_trends():
    return _payload("/posture/trends")

@router.get("/api/roi-calculator")
def get_api_roi_calculator():
    return _payload("/roi-calculator")

@router.get("/api/roles")
def get_api_roles():
    return _payload("/roles")

@router.get("/api/service-ops")
def get_api_service_ops():
    return _payload("/service-ops")

@router.get("/api/settings/notifications")
def get_api_settings_notifications():
    return _payload("/settings/notifications")

@router.get("/api/tenant")
def get_api_tenant():
    return _payload("/tenant")

@router.get("/api/tenant/ai-assistant")
def get_api_tenant_ai_assistant():
    return _payload("/tenant/ai-assistant")

@router.get("/api/tenant/ai-assistant/chat")
def get_api_tenant_ai_assistant_chat():
    return _payload("/tenant/ai-assistant/chat")

@router.get("/api/tenant/compliance")
def get_api_tenant_compliance():
    return _payload("/tenant/compliance")

@router.get("/api/tenant/compliance/audit")
def get_api_tenant_compliance_audit():
    return _payload("/tenant/compliance/audit")

@router.get("/api/tenant/compliance/policies")
def get_api_tenant_compliance_policies():
    return _payload("/tenant/compliance/policies")

@router.get("/api/tenant/copilot")
def get_api_tenant_copilot():
    return _payload("/tenant/copilot")

@router.get("/api/tenant/copilot/chat")
def get_api_tenant_copilot_chat():
    return _payload("/tenant/copilot/chat")

@router.get("/api/tenant/discovery/connect")
def get_api_tenant_discovery_connect():
    return _payload("/tenant/discovery/connect")

@router.get("/api/tenant/discovery/history")
def get_api_tenant_discovery_history():
    return _payload("/tenant/discovery/history")

@router.get("/api/tenant/drift/history")
def get_api_tenant_drift_history():
    return _payload("/tenant/drift/history")

@router.get("/api/tenant/drift/overview")
def get_api_tenant_drift_overview():
    return _payload("/tenant/drift/overview")

@router.get("/api/tenant/drift/policies")
def get_api_tenant_drift_policies():
    return _payload("/tenant/drift/policies")

@router.get("/api/tenant/executive/cio")
def get_api_tenant_executive_cio():
    return _payload("/tenant/executive/cio")

@router.get("/api/tenant/executive/ciso")
def get_api_tenant_executive_ciso():
    return _payload("/tenant/executive/ciso")

@router.get("/api/tenant/executive/cloudops")
def get_api_tenant_executive_cloudops():
    return _payload("/tenant/executive/cloudops")

@router.get("/api/tenant/executive/risk-heatmap")
def get_api_tenant_executive_risk_heatmap():
    return _payload("/tenant/executive/risk-heatmap")

@router.get("/api/tenant/inventory/coverage")
def get_api_tenant_inventory_coverage():
    return _payload("/tenant/inventory/coverage")

@router.get("/api/tenant/overview")
def get_api_tenant_overview():
    return _payload("/tenant/overview")

@router.get("/api/tenant/posture/map")
def get_api_tenant_posture_map():
    return _payload("/tenant/posture/map")

@router.get("/api/tenant/posture/rto-rpo")
def get_api_tenant_posture_rto_rpo():
    return _payload("/tenant/posture/rto-rpo")

@router.get("/api/tenant/posture/scorecard")
def get_api_tenant_posture_scorecard():
    return _payload("/tenant/posture/scorecard")

@router.get("/api/tenant/posture/trends")
def get_api_tenant_posture_trends():
    return _payload("/tenant/posture/trends")

@router.get("/api/tenant/recovery-testing")
def get_api_tenant_recovery_testing():
    return _payload("/tenant/recovery-testing")

@router.get("/api/tenant/recovery-testing/dashboard")
def get_api_tenant_recovery_testing_dashboard():
    return _payload("/tenant/recovery-testing/dashboard")

@router.get("/api/tenant/recovery-testing/simulator")
def get_api_tenant_recovery_testing_simulator():
    return _payload("/tenant/recovery-testing/simulator")

@router.get("/api/tenants")
def get_api_tenants():
    return _payload("/tenants")

@router.get("/api/tenants/provision")
def get_api_tenants_provision():
    return _payload("/tenants/provision")

@router.get("/api/users")
def get_api_users():
    return _payload("/users")
