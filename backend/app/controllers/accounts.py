from fastapi import APIRouter
from app.models.account import (
    AccountCreate,
    Account,
    TestConnectionRequest,
    TestConnectionResponse,
)
from app.models.account_detail import AccountDetail
from app.services.account_service import AccountService


router = APIRouter(prefix="/api/accounts", tags=["accounts"])


@router.post("/cleanup-config")
def cleanup_config():
    """Clean up write_files_to_home_dir from fix.worker configuration."""
    try:
        from app.services.config_service import ConfigService
        success = ConfigService().cleanup_write_files_to_home_dir()
        return {"ok": success, "message": "Configuration cleanup completed" if success else "Configuration cleanup failed"}
    except Exception as e:
        return {"ok": False, "message": f"Error during cleanup: {str(e)}"}

@router.post("/restart-fixworker-and-collect")
def restart_fixworker_and_collect():
    """Restart fixworker container and run collection workflow."""
    try:
        from app.services.config_service import ConfigService
        success = ConfigService().restart_fixworker_and_collect()
        return {"ok": success, "message": "Fixworker restart and collection completed" if success else "Fixworker restart and collection failed"}
    except Exception as e:
        return {"ok": False, "message": f"Error during restart and collection: {str(e)}"}

@router.get("/test-connection-status")
def test_connection_status():
    """Get the current status of connection testing."""
    return {
        "loading": False,
        "message": "Ready to test connection",
        "status": "idle"
    }

@router.post("/test-connection", response_model=TestConnectionResponse)
def test_connection(payload: TestConnectionRequest):
    """
    Test connection validates credentials without updating any configuration.
    This is used to verify credentials before proceeding to account creation.
    """
    import time
    
    details = {"provider": payload.provider, "account": payload.account_identifier}
    loading_message = "Validating credentials..."
    
    # Handle AWS credentials validation
    if payload.provider == "aws" and payload.aws_access_key_id and payload.aws_secret_access_key:
        try:
            # Basic AWS credential validation (structure only)
            if len(payload.aws_access_key_id) < 16:
                details["aws_validation"] = "invalid_access_key_format"
                details["connection_test"] = False
            elif len(payload.aws_secret_access_key) < 20:
                details["aws_validation"] = "invalid_secret_key_format"
                details["connection_test"] = False
            else:
                details["aws_validation"] = "credentials_valid"
                details["connection_test"] = True
                # TODO: Add actual AWS API test here
        except Exception as e:
            details["aws_validation"] = f"error: {str(e)}"
            details["connection_test"] = False
    
    # Handle GCP credentials validation
    elif payload.provider == "gcp" and payload.credentials_json:
        try:
            from app.services.gcp_validation_service import GCPValidationService
            
            gcp_creds = payload.credentials_json.get("gcp", {})
            if not gcp_creds:
                details["gcp_validation"] = "no_gcp_credentials"
                details["connection_test"] = False
            else:
                # Test actual GCP connection with real API calls
                loading_message = "Testing GCP connection..."
                is_connected, message, cred_details = GCPValidationService().test_gcp_connection(gcp_creds)
                
                if is_connected:
                    details["gcp_validation"] = "connection_successful"
                    details["connection_test"] = True
                    details["gcp_message"] = message
                    details.update(cred_details)
                    loading_message = "GCP connection successful!"
                else:
                    details["gcp_validation"] = "connection_failed"
                    details["connection_test"] = False
                    details["gcp_error"] = message
                    loading_message = f"GCP connection failed: {message}"
        except Exception as e:
            details["gcp_validation"] = f"error: {str(e)}"
            details["connection_test"] = False
    
    else:
        details["validation"] = "no_credentials_provided"
        details["connection_test"] = False
        loading_message = "No credentials provided"
    
    return TestConnectionResponse(
        ok=True, 
        details=details, 
        loading=False, 
        message=loading_message
    )


@router.post("", response_model=Account)
def create_account(payload: AccountCreate):
    svc = AccountService()
    return svc.create(payload)


@router.get("", response_model=list[Account])
def list_accounts():
    svc = AccountService()
    return svc.list()


@router.get("/{account_id}", response_model=AccountDetail)
def get_account(account_id: str):
    svc = AccountService()
    return svc.get(account_id)
