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
    return TestConnectionResponse(ok=True, details={"provider": payload.provider, "account": payload.account_identifier})


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
