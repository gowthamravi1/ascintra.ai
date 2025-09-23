from __future__ import annotations

import json
import logging
import subprocess
import time
from typing import Optional

from app.db.arango import get_db

logger = logging.getLogger(__name__)


class ConfigService:
    def update_fix_worker_aws_credentials(
        self,
        access_key_id: str,
        secret_access_key: str,
        account: Optional[str] = None,
        region: Optional[str] = None,
    ) -> bool:
        """Update the configs/fix.worker document with AWS credentials.

        If Arango is not configured, returns False. Returns True on successful update.
        """
        db = get_db()
        if db is None:
            return False
        try:
            col = db.collection("configs")
            doc = col.get("fix.worker")
            if not doc:
                # create a minimal document if missing
                doc = {
                    "_key": "fix.worker",
                    "config": {
                        "aws": {
                            "access_key_id": None,
                            "secret_access_key": None,
                            "account": None,
                            "region": None,
                        }
                    },
                }
                col.insert(doc)

            cfg = doc.setdefault("config", {})
            aws = cfg.setdefault("aws", {})
            aws["access_key_id"] = access_key_id
            aws["secret_access_key"] = secret_access_key
            # Include account as a list (per fix.worker schema expectations)
            if account:
                existing = aws.get("account")
                if isinstance(existing, list):
                    if account not in existing:
                        existing.append(account)
                    aws["account"] = existing
                elif isinstance(existing, str) and existing:
                    # convert single string to list, ensure uniqueness
                    vals = [existing]
                    if account not in vals:
                        vals.append(account)
                    aws["account"] = vals
                else:
                    aws["account"] = [account]
            # Do not persist region for now
            if "region" in aws:
                aws.pop("region", None)

            # Ensure fixworker.collector contains "aws"
            fixworker = cfg.setdefault("fixworker", {})
            collectors = fixworker.setdefault("collector", [])
            # Avoid duplicates and non-list edge cases
            if not isinstance(collectors, list):
                collectors = []
            if "aws" not in collectors:
                collectors.append("aws")
            fixworker["collector"] = collectors
            
            # Completely remove old write_files_to_home_dir format
            if "write_files_to_home_dir" in fixworker:
                logger.info(f"DEBUG: Found write_files_to_home_dir with {len(fixworker['write_files_to_home_dir'])} entries, removing...")
                del fixworker["write_files_to_home_dir"]
                logger.info("DEBUG: Successfully removed write_files_to_home_dir from fixworker config")
            else:
                logger.info("DEBUG: write_files_to_home_dir not found in fixworker config")
            
            # Ensure write_files_to_home_dir is completely removed from the entire config
            if "write_files_to_home_dir" in cfg:
                logger.info("DEBUG: Found write_files_to_home_dir at config level, removing...")
                del cfg["write_files_to_home_dir"]
                logger.info("DEBUG: Successfully removed write_files_to_home_dir from config level")
            
            # Also remove from the root document level
            if "write_files_to_home_dir" in doc:
                logger.info("DEBUG: Found write_files_to_home_dir at document level, removing...")
                del doc["write_files_to_home_dir"]
                logger.info("DEBUG: Successfully removed write_files_to_home_dir from document level")

            col.update(doc)
            return True
        except Exception:
            return False

    def cleanup_write_files_to_home_dir(self) -> bool:
        """Completely remove write_files_to_home_dir from the fix.worker configuration.
        
        This is a dedicated cleanup function that can be called to ensure
        write_files_to_home_dir is completely removed from all levels.
        """
        db = get_db()
        if db is None:
            return False
        try:
            col = db.collection("configs")
            doc = col.get("fix.worker")
            if not doc:
                logger.info("DEBUG: No fix.worker document found, nothing to clean")
                return True
            
            removed_any = False
            
            # Remove from fixworker level
            if "config" in doc and "fixworker" in doc["config"]:
                fixworker = doc["config"]["fixworker"]
                if "write_files_to_home_dir" in fixworker:
                    logger.info(f"DEBUG: Found write_files_to_home_dir in fixworker with {len(fixworker['write_files_to_home_dir'])} entries, removing...")
                    del fixworker["write_files_to_home_dir"]
                    removed_any = True
                    logger.info("DEBUG: Successfully removed write_files_to_home_dir from fixworker")
            
            # Remove from config level
            if "config" in doc and "write_files_to_home_dir" in doc["config"]:
                logger.info(f"DEBUG: Found write_files_to_home_dir in config with {len(doc['config']['write_files_to_home_dir'])} entries, removing...")
                del doc["config"]["write_files_to_home_dir"]
                removed_any = True
                logger.info("DEBUG: Successfully removed write_files_to_home_dir from config")
            
            # Remove from document level
            if "write_files_to_home_dir" in doc:
                logger.info(f"DEBUG: Found write_files_to_home_dir in document with {len(doc['write_files_to_home_dir'])} entries, removing...")
                del doc["write_files_to_home_dir"]
                removed_any = True
                logger.info("DEBUG: Successfully removed write_files_to_home_dir from document")
            
            # Also ensure all files_in_home_dir values are properly formatted as strings
            if "config" in doc and "fixworker" in doc["config"]:
                fixworker = doc["config"]["fixworker"]
                if "files_in_home_dir" in fixworker:
                    files_in_home_dir = fixworker["files_in_home_dir"]
                    if isinstance(files_in_home_dir, dict):
                        for file_path, content in list(files_in_home_dir.items()):
                            if isinstance(content, dict):
                                logger.info(f"DEBUG: Converting JSON object to string for {file_path}")
                                files_in_home_dir[file_path] = json.dumps(content)
                                removed_any = True
                        logger.info("DEBUG: Ensured all files_in_home_dir values are JSON strings")
            
            if removed_any:
                col.update(doc)
                logger.info("DEBUG: Configuration updated after cleanup")
            else:
                logger.info("DEBUG: No write_files_to_home_dir found to clean")
            
            return True
        except Exception as e:
            logger.error(f"DEBUG: Error during cleanup: {e}")
            return False

    def restart_fixworker_and_collect(self) -> bool:
        """Restart fixworker container and run collection workflow.
        
        This function:
        1. Restarts the fixworker container
        2. Waits for it to be ready
        3. Runs the collection workflow inside fixshell
        """
        try:
            logger.info("DEBUG: Starting fixworker restart and collection workflow...")
            
            # Step 1: Restart fixworker container
            logger.info("DEBUG: Restarting fixworker container...")
            result = subprocess.run(
                ["docker", "restart", "fixworker"],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode != 0:
                logger.error(f"DEBUG: Failed to restart fixworker: {result.stderr}")
                return False
            
            logger.info("DEBUG: Fixworker container restarted successfully")
            
            # Step 2: Wait for fixworker to be ready
            logger.info("DEBUG: Waiting for fixworker to be ready...")
            max_attempts = 30
            for attempt in range(max_attempts):
                try:
                    # Check if fixworker is responding
                    result = subprocess.run(
                        ["docker", "exec", "fixworker", "curl", "-s", "http://localhost:9956/health"],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    if result.returncode == 0:
                        logger.info("DEBUG: Fixworker is ready")
                        break
                except subprocess.TimeoutExpired:
                    pass
                
                if attempt < max_attempts - 1:
                    time.sleep(2)
                    logger.info(f"DEBUG: Waiting for fixworker... attempt {attempt + 1}/{max_attempts}")
                else:
                    logger.warning("DEBUG: Fixworker did not become ready in time, proceeding anyway...")
            
            # Step 3: Run collection workflow inside fixshell
            logger.info("DEBUG: Running collection workflow in fixshell...")
            
            # Run the workflow command inside fixsh
            logger.info("DEBUG: Running 'workflow run collect' in fixsh...")
            result = subprocess.run(
                ["docker", "exec", "fixshell", "bash", "-c", "echo 'workflow run collect' | fixsh"],
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout for collection
            )
            
            if result.returncode != 0:
                logger.warning(f"DEBUG: collect command returned non-zero exit code: {result.returncode}")
                logger.warning(f"DEBUG: stderr: {result.stderr}")
            else:
                logger.info("DEBUG: collect completed successfully")
                logger.info(f"DEBUG: stdout: {result.stdout}")
            
            logger.info("DEBUG: Collection workflow completed")
            return True
            
        except subprocess.TimeoutExpired:
            logger.error("DEBUG: Timeout during fixworker restart or collection")
            return False
        except Exception as e:
            logger.error(f"DEBUG: Error during fixworker restart and collection: {e}")
            return False

    def update_fix_worker_gcp_credentials(
        self,
        project_id: str,
        service_account_json: dict,
        project_number: Optional[str] = None,
    ) -> bool:
        """Update the configs/fix.worker document with GCP credentials.

        If Arango is not configured, returns False. Returns True on successful update.
        """
        logger.info(f"DEBUG: update_fix_worker_gcp_credentials called with project_id={project_id}")
        db = get_db()
        if db is None:
            logger.warning("DEBUG: ArangoDB not configured, returning False")
            return False
        try:
            col = db.collection("configs")
            doc = col.get("fix.worker")
            if not doc:
                # create a minimal document if missing
                doc = {
                    "_key": "fix.worker",
                    "config": {
                        "fixworker": {
                            "collector": [],
                            "files_in_home_dir": {}
                        },
                        "gcp": {
                            "service_account": [],
                            "project": [],
                            "collect": [],
                            "no_collect": [],
                            "project_pool_size": 64,
                            "fork_process": True,
                            "discard_account_on_resource_error": False,
                            "collect_usage_metrics": True
                        }
                    },
                }
                col.insert(doc)

            cfg = doc.setdefault("config", {})
            
            # Ensure fixworker.collector contains "gcp"
            fixworker = cfg.setdefault("fixworker", {})
            collectors = fixworker.setdefault("collector", [])
            if not isinstance(collectors, list):
                collectors = []
            if "gcp" not in collectors:
                collectors.append("gcp")
            fixworker["collector"] = collectors

            # Completely remove old write_files_to_home_dir format
            if "write_files_to_home_dir" in fixworker:
                logger.info(f"DEBUG: Found write_files_to_home_dir with {len(fixworker['write_files_to_home_dir'])} entries, removing...")
                del fixworker["write_files_to_home_dir"]
                logger.info("DEBUG: Successfully removed write_files_to_home_dir from fixworker config")
            else:
                logger.info("DEBUG: write_files_to_home_dir not found in fixworker config")
            
            # Ensure write_files_to_home_dir is completely removed from the entire config
            if "write_files_to_home_dir" in cfg:
                logger.info("DEBUG: Found write_files_to_home_dir at config level, removing...")
                del cfg["write_files_to_home_dir"]
                logger.info("DEBUG: Successfully removed write_files_to_home_dir from config level")
            
            # Also remove from the root document level
            if "write_files_to_home_dir" in doc:
                logger.info("DEBUG: Found write_files_to_home_dir at document level, removing...")
                del doc["write_files_to_home_dir"]
                logger.info("DEBUG: Successfully removed write_files_to_home_dir from document level")
            
            # Add service account JSON to files_in_home_dir (new format)
            files_in_home_dir = fixworker.setdefault("files_in_home_dir", {})
            if not isinstance(files_in_home_dir, dict):
                files_in_home_dir = {}
            
            # Convert any existing JSON objects to strings in files_in_home_dir
            for file_path, content in list(files_in_home_dir.items()):
                if isinstance(content, dict):
                    files_in_home_dir[file_path] = json.dumps(content)
            
            # Create a unique filename for this service account
            service_account_filename = f"~/.gcp/{project_id}-service-account.json"
            
            # Add/update the service account file (ensure it's stored as JSON-escaped string, not object)
            files_in_home_dir[service_account_filename] = json.dumps(service_account_json)
            
            logger.info(f"DEBUG: Adding service account file: {service_account_filename}")
            logger.info(f"DEBUG: files_in_home_dir content: {files_in_home_dir}")
            
            fixworker["files_in_home_dir"] = files_in_home_dir

            # Update GCP configuration
            gcp = cfg.setdefault("gcp", {})
            service_accounts = gcp.setdefault("service_account", [])
            if not isinstance(service_accounts, list):
                service_accounts = []
            
            # Add the service account file path if not already present
            service_account_path = f"/home/fixinventory/.gcp/{project_id}-service-account.json"
            if service_account_path not in service_accounts:
                service_accounts.append(service_account_path)
            gcp["service_account"] = service_accounts

            # Add project to GCP projects list if provided
            if project_number:
                projects = gcp.setdefault("project", [])
                if not isinstance(projects, list):
                    projects = []
                if project_id not in projects:
                    projects.append(project_id)
                gcp["project"] = projects

            col.update(doc)
            logger.info(f"DEBUG: Successfully updated fix.worker config for GCP project {project_id}")
            
            # Restart fixworker and run collection workflow
            logger.info("DEBUG: Starting fixworker restart and collection workflow...")
            restart_success = self.restart_fixworker_and_collect()
            if restart_success:
                logger.info("DEBUG: Fixworker restart and collection completed successfully")
            else:
                logger.warning("DEBUG: Fixworker restart and collection failed, but config was updated")
            
            return True
        except Exception as e:
            logger.error(f"Error updating GCP config: {e}")
            return False
