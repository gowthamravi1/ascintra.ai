from __future__ import annotations

from typing import Any, Dict, Optional
from pydantic import BaseModel


class AccountDetail(BaseModel):
    id: str
    provider: str
    account_identifier: str
    name: Optional[str] = None
    primary_region: Optional[str] = None

    # AWS
    aws_role_arn: Optional[str] = None
    aws_external_id: Optional[str] = None

    # GCP
    gcp_project_number: Optional[str] = None
    gcp_sa_email: Optional[str] = None

    credentials_json: Optional[Dict[str, Any]] = None
    discovery_enabled: bool = True
    discovery_options: Dict[str, Any] = {}
    discovery_frequency: Optional[str] = None
    preferred_time_utc: Optional[str] = None
    connection_status: str
    connection_last_tested_at: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
