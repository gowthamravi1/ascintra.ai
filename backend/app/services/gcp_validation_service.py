import logging
from typing import Dict, Any, Tuple
import json

logger = logging.getLogger(__name__)


class GCPValidationService:
    """Service for validating GCP credentials without updating configuration."""
    
    def validate_service_account_credentials(self, service_account_json: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Validate GCP service account credentials.
        
        Args:
            service_account_json: The service account JSON credentials
            
        Returns:
            Tuple of (is_valid, message, details)
        """
        try:
            # Check required fields
            required_fields = [
                "type", "project_id", "private_key_id", "private_key", 
                "client_email", "client_id", "auth_uri", "token_uri"
            ]
            
            missing_fields = []
            for field in required_fields:
                if not service_account_json.get(field):
                    missing_fields.append(field)
            
            if missing_fields:
                return False, f"Missing required fields: {', '.join(missing_fields)}", {}
            
            # Validate field values
            if service_account_json.get("type") != "service_account":
                return False, "Invalid type: must be 'service_account'", {}
            
            if not service_account_json.get("project_id"):
                return False, "Project ID is required", {}
            
            if not service_account_json.get("client_email"):
                return False, "Client email is required", {}
            
            if not service_account_json.get("private_key"):
                return False, "Private key is required", {}
            
            # Check if private key looks valid (starts with -----BEGIN)
            private_key = service_account_json.get("private_key", "")
            if not private_key.startswith("-----BEGIN"):
                return False, "Invalid private key format", {}
            
            # Extract useful information
            details = {
                "project_id": service_account_json.get("project_id"),
                "client_email": service_account_json.get("client_email"),
                "client_id": service_account_json.get("client_id"),
                "auth_uri": service_account_json.get("auth_uri"),
                "token_uri": service_account_json.get("token_uri"),
                "has_private_key": bool(service_account_json.get("private_key")),
                "private_key_id": service_account_json.get("private_key_id")
            }
            
            logger.info(f"GCP credentials validation successful for project: {details['project_id']}")
            return True, "Credentials are valid", details
            
        except Exception as e:
            logger.error(f"Error validating GCP credentials: {e}")
            return False, f"Validation error: {str(e)}", {}
    
    def test_gcp_connection(self, service_account_json: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Test actual GCP connection using the credentials.
        Makes real API calls to GCP to verify the credentials work.
        
        Args:
            service_account_json: The service account JSON credentials
            
        Returns:
            Tuple of (is_connected, message, details)
        """
        try:
            # First validate the structure
            is_valid, message, details = self.validate_service_account_credentials(service_account_json)
            
            if not is_valid:
                return False, f"Invalid credentials: {message}", details
            
            # Now make actual GCP API calls
            try:
                from google.oauth2 import service_account
                from google.cloud import resourcemanager
                from google.api_core import exceptions as gcp_exceptions
                
                # Create credentials object
                credentials = service_account.Credentials.from_service_account_info(service_account_json)
                
                # Test 1: List projects using Resource Manager API
                client = resourcemanager.ProjectsClient(credentials=credentials)
                
                # Make a simple API call to test credentials
                project_id = service_account_json.get("project_id")
                project_name = f"projects/{project_id}"
                
                try:
                    # Try to get the specific project
                    project = client.get_project(name=project_name)
                    details["project_name"] = project.display_name
                    details["project_number"] = project.name.split("/")[-1]
                    details["project_state"] = project.state.name
                    
                    logger.info(f"GCP connection test successful for project: {project_id}")
                    return True, "Connection test successful - Project verified", details
                    
                except gcp_exceptions.NotFound:
                    # Project not found, but credentials might be valid
                    # Try to list projects to verify credentials work
                    try:
                        projects = list(client.list_projects())
                        if projects:
                            details["accessible_projects"] = len(projects)
                            details["project_not_found"] = True
                            logger.info(f"GCP credentials valid but project {project_id} not found. Found {len(projects)} accessible projects.")
                            return True, f"Credentials valid but project {project_id} not found. Found {len(projects)} accessible projects.", details
                        else:
                            return False, f"Credentials valid but no projects accessible and project {project_id} not found", details
                    except Exception as list_error:
                        return False, f"Credentials valid but cannot access projects: {str(list_error)}", details
                        
            except ImportError:
                # Google Cloud libraries not available, fall back to basic validation
                logger.warning("Google Cloud libraries not available, using basic validation only")
                return True, "Credentials structure valid (GCP libraries not available for full validation)", details
                
        except Exception as e:
            logger.error(f"Error testing GCP connection: {e}")
            return False, f"Connection test failed: {str(e)}", {}
