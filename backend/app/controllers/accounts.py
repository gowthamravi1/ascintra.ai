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


@router.post("/test-connection", response_model=TestConnectionResponse)
def test_connection(payload: TestConnectionRequest):
    # For now, always succeed. Echo minimal details.
    details = {"provider": payload.provider, "account": payload.account_identifier}
    # If AWS credentials are provided, persist them into Arango configs/fix.worker
    if payload.provider == "aws" and payload.aws_access_key_id and payload.aws_secret_access_key:
        try:
            from app.services.config_service import ConfigService

            ok = ConfigService().update_fix_worker_aws_credentials(
                access_key_id=payload.aws_access_key_id,
                secret_access_key=payload.aws_secret_access_key,
                account=payload.account_identifier,
            )
            details["config_updated"] = bool(ok)
        except Exception:
            details["config_updated"] = False
    return TestConnectionResponse(ok=True, details=details)


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
