from __future__ import annotations

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class AccountCreate(BaseModel):
    provider: str = Field(pattern=r"^(aws|gcp)$")
    account_identifier: str  # AWS account id or GCP project id
    name: Optional[str] = None
    primary_region: Optional[str] = None

    # AWS specific
    aws_role_arn: Optional[str] = None
    aws_external_id: Optional[str] = None

    # GCP specific
    gcp_project_number: Optional[str] = None
    gcp_sa_email: Optional[str] = None

    discovery_enabled: bool = True
    discovery_options: Dict[str, Any] = {}
    credentials_json: Optional[Dict[str, Any]] = None
    discovery_frequency: Optional[str] = None
    preferred_time_utc: Optional[str] = None


class Account(BaseModel):
    id: str
    provider: str
    account_identifier: str
    name: Optional[str] = None
    primary_region: Optional[str] = None
    connection_status: str


class TestConnectionRequest(BaseModel):
    provider: str = Field(pattern=r"^(aws|gcp)$")
    account_identifier: str
    aws_role_arn: Optional[str] = None
    gcp_sa_email: Optional[str] = None
    # For alignment with UI selections (not validated here)
    discovery_frequency: Optional[str] = None
    preferred_time_utc: Optional[str] = None


class TestConnectionResponse(BaseModel):
    ok: bool
    details: Dict[str, Any] = {}
