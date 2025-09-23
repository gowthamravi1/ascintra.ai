from __future__ import annotations

from typing import List
from datetime import datetime

from app.core.config import settings
from app.db.arango import get_db, has_collection
from sqlalchemy import select, delete
from sqlalchemy.orm import Session
from app.db.session import get_session
from app.orm.models import AssetsInventory, CloudAccount
from dateutil import parser as dateparser
from app.models.inventory import (
    InventoryItem,
    InventorySummary,
    InventoryListResponse,
    InventoryDetails,
    InventoryDetailsResponse,
)

# AWS Resource Types
AWS_RESOURCE_TYPES = {
    'aws_account', 'aws_acm_certificate', 'aws_alb', 'aws_alb_target_group', 'aws_apigateway_authorizer',
    'aws_resource',  # Generic AWS resource type
    'aws_apigateway_deployment', 'aws_apigateway_domain_name', 'aws_apigateway_resource', 'aws_apigateway_rest_api',
    'aws_apigateway_stage', 'aws_athena_data_catalog', 'aws_athena_work_group', 'aws_autoscaling_group',
    'aws_backup_copy_job', 'aws_backup_framework', 'aws_backup_job', 'aws_backup_legal_hold', 'aws_backup_plan',
    'aws_backup_protected_resource', 'aws_backup_recovery_point', 'aws_backup_report_plan', 'aws_backup_restore_job',
    'aws_backup_restore_testing_plan', 'aws_backup_vault', 'aws_beanstalk_application', 'aws_beanstalk_environment',
    'aws_bedrock_agent', 'aws_bedrock_agent_flow', 'aws_bedrock_agent_flow_version', 'aws_bedrock_agent_knowledge_base',
    'aws_bedrock_agent_prompt', 'aws_bedrock_custom_model', 'aws_bedrock_evaluation_job', 'aws_bedrock_foundation_model',
    'aws_bedrock_guardrail', 'aws_bedrock_model_customization_job', 'aws_bedrock_provisioned_model_throughput',
    'aws_cloud_formation_stack_instance_summary', 'aws_cloud_trail', 'aws_cloudformation_stack', 'aws_cloudformation_stack_set',
    'aws_cloudfront_cache_policy', 'aws_cloudfront_distribution', 'aws_cloudfront_field_level_encryption_config',
    'aws_cloudfront_field_level_encryption_profile', 'aws_cloudfront_function', 'aws_cloudfront_origin_access_control',
    'aws_cloudfront_public_key', 'aws_cloudfront_realtime_log_config', 'aws_cloudfront_response_headers_policy',
    'aws_cloudfront_streaming_distribution', 'aws_cloudwatch_alarm', 'aws_cloudwatch_log_group', 'aws_cloudwatch_metric_filter',
    'aws_cognito_group', 'aws_cognito_user', 'aws_cognito_user_pool', 'aws_config_recorder', 'aws_dynamodb_global_table',
    'aws_dynamodb_table', 'aws_ec2_elastic_ip', 'aws_ec2_flow_log', 'aws_ec2_host', 'aws_ec2_image', 'aws_ec2_instance',
    'aws_ec2_instance_type', 'aws_ec2_internet_gateway', 'aws_ec2_keypair', 'aws_ec2_launch_template', 'aws_ec2_nat_gateway',
    'aws_ec2_network_acl', 'aws_ec2_network_interface', 'aws_ec2_reserved_instances', 'aws_ec2_route_table',
    'aws_ec2_security_group', 'aws_ec2_snapshot', 'aws_ec2_subnet', 'aws_ec2_volume', 'aws_ec2_volume_type',
    'aws_ecr_repository', 'aws_ecs_capacity_provider', 'aws_ecs_cluster', 'aws_ecs_container_instance', 'aws_ecs_service',
    'aws_ecs_task', 'aws_ecs_task_definition', 'aws_efs_access_point', 'aws_efs_file_system', 'aws_efs_mount_target',
    'aws_eks_cluster', 'aws_eks_nodegroup', 'aws_elasticache_cache_cluster', 'aws_elasticache_replication_group',
    'aws_elb', 'aws_glacier_job', 'aws_glacier_vault', 'aws_guard_duty_finding', 'aws_iam_access_key', 'aws_iam_group',
    'aws_iam_instance_profile', 'aws_iam_policy', 'aws_iam_role', 'aws_iam_server_certificate', 'aws_iam_user',
    'aws_inspector_finding', 'aws_kinesis_stream', 'aws_kms_key', 'aws_lambda_function', 'aws_opensearch_domain',
    'aws_organizational_root', 'aws_organizational_unit', 'aws_q_apps', 'aws_q_apps_library_item', 'aws_q_business_application',
    'aws_q_business_conversation', 'aws_q_business_data_source', 'aws_q_business_data_source_sync_job', 'aws_q_business_document',
    'aws_q_business_indice', 'aws_q_business_message', 'aws_q_business_plugin', 'aws_q_business_retriever',
    'aws_q_business_web_experience', 'aws_rds_cluster', 'aws_rds_cluster_snapshot', 'aws_rds_instance', 'aws_rds_snapshot',
    'aws_redshift_cluster', 'aws_region', 'aws_root_user', 'aws_route53_resource_record', 'aws_route53_resource_record_set',
    'aws_route53_zone', 'aws_s3_account_settings', 'aws_s3_bucket', 'aws_sagemaker_algorithm', 'aws_sagemaker_app',
    'aws_sagemaker_artifact', 'aws_sagemaker_auto_ml_job', 'aws_sagemaker_code_repository', 'aws_sagemaker_compilation_job',
    'aws_sagemaker_domain', 'aws_sagemaker_endpoint', 'aws_sagemaker_experiment', 'aws_sagemaker_hyper_parameter_tuning_job',
    'aws_sagemaker_image', 'aws_sagemaker_inference_recommendations_job', 'aws_sagemaker_job', 'aws_sagemaker_labeling_job',
    'aws_sagemaker_model', 'aws_sagemaker_notebook', 'aws_sagemaker_pipeline', 'aws_sagemaker_processing_job',
    'aws_sagemaker_project', 'aws_sagemaker_training_job', 'aws_sagemaker_transform_job', 'aws_sagemaker_trial',
    'aws_sagemaker_user_profile', 'aws_sagemaker_workteam', 'aws_secretsmanager_secret', 'aws_service_quota',
    'aws_sns_endpoint', 'aws_sns_platform_application', 'aws_sns_subscription', 'aws_sns_topic', 'aws_sqs_queue',
    'aws_ssm_document', 'aws_ssm_instance', 'aws_ssm_resource_compliance', 'aws_vpc', 'aws_vpc_endpoint',
    'aws_vpc_peering_connection', 'aws_waf_web_acl'
}

# GCP Resource Types
GCP_RESOURCE_TYPES = {
    'gcp_accelerator_type', 'gcp_address', 'gcp_autoscaler', 'gcp_backend_bucket', 'gcp_backend_service',
    'gcp_billing_account', 'gcp_bucket', 'gcp_cloud_function', 'gcp_commitment', 'gcp_container_cluster',
    'gcp_container_operation', 'gcp_disk', 'gcp_disk_type', 'gcp_external_vpn_gateway', 'gcp_filestore_backup',
    'gcp_filestore_instance', 'gcp_filestore_instance_snapshot', 'gcp_firestore_backup', 'gcp_firestore_database',
    'gcp_firestore_document', 'gcp_firewall', 'gcp_firewall_policy', 'gcp_forwarding_rule', 'gcp_health_check',
    'gcp_health_check_service', 'gcp_http_health_check', 'gcp_https_health_check', 'gcp_image', 'gcp_instance',
    'gcp_instance_group', 'gcp_instance_group_manager', 'gcp_instance_template', 'gcp_interconnect',
    'gcp_interconnect_attachment', 'gcp_interconnect_location', 'gcp_license', 'gcp_machine_image',
    'gcp_machine_type', 'gcp_network', 'gcp_network_edge_security_service', 'gcp_network_endpoint_group',
    'gcp_node_group', 'gcp_node_template', 'gcp_node_type', 'gcp_notification_endpoint', 'gcp_object',
    'gcp_operation', 'gcp_packet_mirroring', 'gcp_project', 'gcp_project_billing_info', 'gcp_public_advertised_prefix',
    'gcp_public_delegated_prefix', 'gcp_pubsub_snapshot', 'gcp_pubsub_subscription', 'gcp_pubsub_topic',
    'gcp_region', 'gcp_region_quota', 'gcp_resource_policy', 'gcp_route', 'gcp_router', 'gcp_scc_finding',
    'gcp_security_policy', 'gcp_service', 'gcp_service_attachment', 'gcp_sku', 'gcp_snapshot',
    'gcp_sql_backup_run', 'gcp_sql_database', 'gcp_sql_database_instance', 'gcp_sql_operation', 'gcp_sql_user',
    'gcp_ssl_certificate', 'gcp_ssl_policy', 'gcp_subnetwork', 'gcp_target_grpc_proxy', 'gcp_target_http_proxy',
    'gcp_target_https_proxy', 'gcp_target_instance', 'gcp_target_pool', 'gcp_target_ssl_proxy',
    'gcp_target_tcp_proxy', 'gcp_target_vpn_gateway', 'gcp_url_map', 'gcp_vertex_ai_batch_prediction_job',
    'gcp_vertex_ai_custom_job', 'gcp_vertex_ai_dataset', 'gcp_vertex_ai_dataset_version', 'gcp_vertex_ai_endpoint',
    'gcp_vertex_ai_feature', 'gcp_vertex_ai_feature_group', 'gcp_vertex_ai_featurestore',
    'gcp_vertex_ai_hyperparameter_tuning_job', 'gcp_vertex_ai_index', 'gcp_vertex_ai_index_endpoint',
    'gcp_vertex_ai_model', 'gcp_vertex_ai_model_deployment_monitoring_job', 'gcp_vertex_ai_model_evaluation',
    'gcp_vertex_ai_pipeline_job', 'gcp_vertex_ai_schedule', 'gcp_vertex_ai_tensorboard',
    'gcp_vertex_ai_training_pipeline', 'gcp_vertex_ai_tuning_job', 'gcp_vpn_gateway', 'gcp_vpn_tunnel', 'gcp_zone'
}

# Combined valid resource types
VALID_RESOURCE_TYPES = AWS_RESOURCE_TYPES | GCP_RESOURCE_TYPES

# Invalid resource IDs (regions, common non-resource values)
INVALID_RESOURCE_IDS = {
    'us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'us-east-2', 'us-west-1', 
    'eu-central-1', 'eu-west-2', 'eu-west-3', 'ap-northeast-1', 'ap-northeast-2', 
    'ap-southeast-2', 'ap-south-1', 'ca-central-1', 'sa-east-1', 'us-central-1',
    'eu-north-1', 'ap-northeast-3', 'me-south-1', 'af-south-1', 'eu-south-1',
    'ap-east-1', 'me-central-1', 'il-central-1', 'ap-southeast-3', 'ap-southeast-4',
    'us-iso-east-1', 'us-iso-west-1', 'us-isob-east-1', 'us-iso-central-1',
    'aws', 'gcp', 'cloud', 'account', 'region', 'zone', 'project', 'organization'
}

# Selected Resource Types - Priority resources for materialization
SELECTED_RESOURCE_TYPES = {
    # AWS Compute & Storage
    'aws_ec2_instance',           # EC2 instances
    'aws_ec2_volume',            # EBS volumes
    'aws_ec2_snapshot',          # EBS snapshots
    'aws_s3_bucket',             # S3 buckets
    'aws_rds_db_instance',       # RDS instances
    'aws_rds_db_cluster',        # RDS clusters
    'aws_efs_file_system',       # EFS file systems
    'aws_fsx_file_system',       # FSx file systems
    
    # AWS Kubernetes & Containers
    'aws_eks_cluster',           # EKS clusters
    'aws_eks_nodegroup',         # EKS node groups
    'aws_ecs_cluster',           # ECS clusters
    'aws_ecs_service',           # ECS services
    'aws_ecs_task_definition',   # ECS task definitions
    
    # AWS Lambda & Serverless
    'aws_lambda_function',       # Lambda functions
    'aws_lambda_layer',          # Lambda layers
    
    # AWS Backup & Recovery
    'aws_backup_plan',           # Backup plans
    'aws_backup_vault',          # Backup vaults
    'aws_backup_protected_resource',  # Protected resources
    'aws_backup_recovery_point', # Recovery points
    
    # GCP Compute & Storage
    'gcp_compute_instance',      # GCP instances
    'gcp_compute_disk',          # GCP disks
    'gcp_compute_snapshot',      # GCP snapshots
    'gcp_storage_bucket',        # GCP storage buckets
    'gcp_sql_database_instance', # Cloud SQL instances
    'gcp_sql_database',          # Cloud SQL databases
    'gcp_filestore_instance',    # Filestore instances
    
    # GCP Networking
    'gcp_address',               # Static IP addresses
    'gcp_network',               # VPC networks
    'gcp_subnetwork',            # Subnets
    'gcp_firewall',              # Firewall rules
    'gcp_route',                 # Routes
    'gcp_router',                # Cloud Routers
    'gcp_forwarding_rule',       # Load balancer forwarding rules

    
    # GCP Kubernetes & Containers
    'gcp_container_cluster',     # GKE clusters
    'gcp_container_node_pool',   # GKE node pools
    # 'gcp_container_operation',   # GKE operations
    # 'gcp_cloud_run_service',     # Cloud Run services
    'gcp_cloud_functions_function', # Cloud Functions
        
    # GCP Messaging & Pub/Sub
    'gcp_pubsub_topic',          # Pub/Sub topics
    'gcp_pubsub_subscription',   # Pub/Sub subscriptions
    
    # GCP Backup & Recovery
    'gcp_backup_plan',           # Backup plans
    'gcp_backup_vault',          # Backup vaults
    'gcp_backup_policy',         # Backup policies
    'gcp_snapshot',              # Disk snapshots
    
}


class InventoryService:
    def __init__(self) -> None:
        self.collection = settings.arango_inventory_collection
        self.fix_collection = settings.arango_fix_collection

    @staticmethod
    def extract_service_name(kind: str) -> str:
        """Extract service name from resource kind"""
        if kind.startswith("aws_"):
            parts = kind.split("_")
            if len(parts) > 1:
                return parts[1]
        elif kind.startswith("gcp_"):
            parts = kind.split("_")
            if len(parts) > 1:
                return parts[1]
        return "unknown"

    @staticmethod
    def is_valid_resource(kind: str, resource_id: str) -> bool:
        """Check if resource kind and ID are valid (only selected priority resources)"""
        return (kind in SELECTED_RESOURCE_TYPES and 
                resource_id and 
                resource_id not in INVALID_RESOURCE_IDS)

    def materialize_assets_from_fix(self, account_identifier: str | None = None) -> dict:
        """Scan the `fix` inventory and upsert selected priority assets into Postgres `assets_inventory`.

        - Includes only SELECTED resource types (instances, volumes, storage, RDS, S3, Kubernetes, Lambda, etc.).
        - Applies heuristics for protection status when possible (EBS snapshots, EC2 via attached volumes,
          S3 versioning/replication, RDS retention). Other types default to "unprotected" until rules are added.
        - Persists each asset with an `account_id` field so that per-account views and rescans are supported.

        Returns aggregate totals: { total, protected, unprotected } for the provided account if specified,
        otherwise for the whole dataset.
        """
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Starting materialization for account: {account_identifier}")
        
        db = get_db()
        if db is None:
            logger.warning("No ArangoDB connection available")
            return {"total": 0, "protected": 0, "unprotected": 0}
        
        logger.info(f"ArangoDB connected, using collections: {self.fix_collection}")
        
        try:
            # Comprehensive materialization plan for all AWS and GCP resource types
            # - Process ALL resources from fix collection
            # - Apply protection heuristics for known resource types
            # - Default to unprotected for unknown types

            # Note: AQL-level validation removed due to array size limits
            # Validation will be done in Python instead
            
            aql = f"""
            /* 1) Snapshot aggregation by EBS volume for protection analysis */
            LET snapAgg = (
              FOR s IN {self.fix_collection}
                FILTER 'aws_ec2_snapshot' IN s.kinds
                COLLECT volId = s.reported.volume_id INTO grp
                LET times = (FOR g IN grp RETURN g.s.reported.created_at)
                RETURN {{ volId, count: LENGTH(grp), last: MAX(times) }}
            )
            LET snapByVol = MERGE(FOR x IN snapAgg RETURN {{ [x.volId]: {{ count: x.count, last: x.last }} }})

            /* 2) Process ALL resources from fix collection */
            LET allResources = (
              FOR v IN {self.fix_collection}
                LET kinds = v.kinds || []
                /* Find the most specific kind (aws_* or gcp_* prefixed) */
                LET primaryKind = (
                  FIRST(FOR k IN kinds 
                    FILTER k != null AND (LIKE(k, 'aws_%', true) OR LIKE(k, 'gcp_%', true))
                    FILTER k != 'aws_resource' AND k != 'gcp_resource'  /* Exclude generic resource types */
                    SORT LENGTH(k) DESC
                    RETURN k
                  ) ||
                  FIRST(FOR k IN kinds 
                    FILTER k != null AND (LIKE(k, 'aws_%', true) OR LIKE(k, 'gcp_%', true))
                    RETURN k
                  ) ||
                  FIRST(FOR k IN kinds FILTER k != null RETURN k)
                )
                FILTER primaryKind != null
                
                /* Determine provider and service */
                LET isAws = LIKE(primaryKind, 'aws_%', true)
                LET isGcp = LIKE(primaryKind, 'gcp_%', true)
                LET provider = isAws ? 'aws' : (isGcp ? 'gcp' : 'unknown')
                
                /* Extract service name from kind */
                LET pos = FIND_FIRST(primaryKind, '_', 4)
                LET extracted = pos != null && pos > 0 ? SUBSTRING(primaryKind, 4, pos - 4) : null
                LET serviceName = (
                  isAws ? (
                    extracted != null && LENGTH(extracted) > 0 ? extracted :
                    primaryKind == 'aws_resource' ? 'resource' :
                    'unknown'
                  ) :
                  isGcp ? (
                    extracted != null && LENGTH(extracted) > 0 ? extracted :
                    primaryKind == 'gcp_resource' ? 'resource' :
                    'unknown'
                  ) :
                  'unknown'
                )
                
                /* Extract resource ID and name */
                LET resourceId = (
                  v.reported.id || 
                  v.reported.arn || 
                  v.reported.name || 
                  v.reported.bucket || 
                  v.reported.db_instance_identifier ||
                  v.reported.instance_id ||
                  CONCAT(primaryKind, '_', TO_STRING(v._key))
                )
                
                /* Basic filtering - detailed validation done in Python */
                FILTER resourceId != null AND resourceId != ''
                LET resourceName = (
                  v.reported.name || 
                  (v.reported.tags && v.reported.tags.Name) || 
                  v.reported.bucket || 
                  v.reported.db_instance_identifier ||
                  v.reported.instance_id ||
                  resourceId
                )
                
                /* Extract region */
                LET region = (
                  v.reported.region || 
                  (v.reported.availability_zone ? SUBSTRING(v.reported.availability_zone, 0, LENGTH(v.reported.availability_zone) - 1) : null) ||
                  (v.reported.location || null)
                )
                
                /* Determine protection status based on resource type */
                LET protectionStatus = (
                  /* EBS Volume protection via snapshots */
                  primaryKind == 'aws_ec2_volume' ? (
                    LET snap = snapByVol[resourceId]
                    RETURN snap && snap.count > 0 ? 'protected' : 'unprotected'
                  ) :
                  
                  /* EC2 Instance protection via attached volume snapshots */
                  primaryKind == 'aws_ec2_instance' ? (
                    LET hasProtectedVolumes = LENGTH(
                      FOR att IN (v.reported.volume_attachments || [])
                        LET snap = snapByVol[att.volume_id]
                        FILTER snap && snap.count > 0
                        RETURN 1
                    ) > 0
                    RETURN hasProtectedVolumes ? 'protected' : 'unprotected'
                  ) :
                  
                  /* S3 Bucket protection via versioning/replication */
                  primaryKind == 'aws_s3_bucket' ? (
                    LET versioning = v.reported.versioning && (v.reported.versioning.status || v.reported.versioning.Status)
                    LET hasVersioning = versioning == 'Enabled' || versioning == true
                    LET hasReplication = v.reported.replication_configuration != null
                    RETURN (hasVersioning || hasReplication) ? 'protected' : 'unprotected'
                  ) :
                  
                  /* RDS Instance protection via backup retention */
                  primaryKind == 'aws_rds_db_instance' ? (
                    LET retention = TO_NUMBER(v.reported.backup_retention_period)
                    RETURN (retention != null && retention > 0) ? 'protected' : 'unprotected'
                  ) :
                  
                  /* GCP Disk protection via snapshots */
                  primaryKind == 'gcp_disk' ? (
                    LET hasSnapshots = v.reported.snapshots && LENGTH(v.reported.snapshots) > 0
                    RETURN hasSnapshots ? 'protected' : 'unprotected'
                  ) :
                  
                  /* GCP Instance protection via disk snapshots */
                  primaryKind == 'gcp_instance' ? (
                    LET hasProtectedDisks = LENGTH(
                      FOR disk IN (v.reported.disks || [])
                        FILTER disk.snapshots && LENGTH(disk.snapshots) > 0
                        RETURN 1
                    ) > 0
                    RETURN hasProtectedDisks ? 'protected' : 'unprotected'
                  ) :
                  
                  /* GCP Storage Bucket protection via versioning */
                  primaryKind == 'gcp_storage_bucket' ? (
                    LET hasVersioning = v.reported.versioning && (v.reported.versioning.enabled || v.reported.versioning.Enabled)
                    LET hasReplication = v.reported.replication && (v.reported.replication.enabled || v.reported.replication.Enabled)
                    RETURN (hasVersioning || hasReplication) ? 'protected' : 'unprotected'
                  ) :
                  
                  /* GCP SQL Database Instance protection via backups */
                  primaryKind == 'gcp_sql_database_instance' ? (
                    LET hasBackups = v.reported.backup_enabled || v.reported.backupConfiguration && v.reported.backupConfiguration.enabled
                    RETURN hasBackups ? 'protected' : 'unprotected'
                  ) :
                  
                  /* GCP Filestore Instance protection via snapshots */
                  primaryKind == 'gcp_filestore_instance' ? (
                    LET hasSnapshots = v.reported.snapshots && LENGTH(v.reported.snapshots) > 0
                    RETURN hasSnapshots ? 'protected' : 'unprotected'
                  ) :
                  
                  /* GCP Container Cluster protection via backup policies */
                  primaryKind == 'gcp_container_cluster' ? (
                    LET hasBackupPolicy = v.reported.backup_policy && v.reported.backup_policy.enabled
                    RETURN hasBackupPolicy ? 'protected' : 'unprotected'
                  ) :
                  
                  /* GCP Snapshot protection (always protected) */
                  primaryKind == 'gcp_snapshot' ? 'protected' :
                  
                  /* GCP SQL Backup Run protection (always protected) */
                  primaryKind == 'gcp_sql_backup_run' ? 'protected' :
                  
                  /* Default to unprotected for other resource types */
                  'unprotected'
                )
                
                /* Get last backup time if available */
                LET lastBackup = (
                  primaryKind == 'aws_ec2_volume' ? (
                    LET snap = snapByVol[resourceId]
                    RETURN snap ? snap.last : null
                  ) :
                  primaryKind == 'aws_ec2_instance' ? (
                    LET lastBackups = (
                      FOR att IN (v.reported.volume_attachments || [])
                        LET snap = snapByVol[att.volume_id]
                        FILTER snap && snap.last
                        RETURN snap.last
                    )
                    RETURN LENGTH(lastBackups) > 0 ? MAX(lastBackups) : null
                  ) :
                  primaryKind == 'gcp_disk' ? (
                    LET snapshots = v.reported.snapshots || []
                    LET lastSnapshots = (
                      FOR snap IN snapshots
                        FILTER snap.created_at
                        RETURN snap.created_at
                    )
                    RETURN LENGTH(lastSnapshots) > 0 ? MAX(lastSnapshots) : null
                  ) :
                  primaryKind == 'gcp_instance' ? (
                    LET lastSnapshots = (
                      FOR disk IN (v.reported.disks || [])
                        FOR snap IN (disk.snapshots || [])
                          FILTER snap.created_at
                          RETURN snap.created_at
                    )
                    RETURN LENGTH(lastSnapshots) > 0 ? MAX(lastSnapshots) : null
                  ) :
                  primaryKind == 'gcp_sql_database_instance' ? (
                    v.reported.last_backup_time || v.reported.backupConfiguration && v.reported.backupConfiguration.startTime
                  ) :
                  primaryKind == 'gcp_snapshot' ? (
                    v.reported.created_at || v.reported.creation_timestamp
                  ) :
                  primaryKind == 'gcp_sql_backup_run' ? (
                    v.reported.start_time || v.reported.enqueued_time
                  ) :
                  null
                )
                
                RETURN {{
                  provider: provider,
                  service: serviceName,
                  kind: primaryKind,
                  resourceId: resourceId,
                  name: resourceName,
                  region: region,
                  status: protectionStatus,
                  last_backup: lastBackup,
                  sourceId: TO_STRING(v._id),
                  tags: v.reported.tags || {{}}
                }}
            )

            RETURN {{
              total: LENGTH(allResources),
              protected: LENGTH(FOR r IN allResources FILTER r.status == 'protected' RETURN 1),
              unprotected: LENGTH(FOR r IN allResources FILTER r.status == 'unprotected' RETURN 1),
              table: allResources
            }}
            """

            logger.info("Executing AQL query...")
            try:
                cur = db.aql.execute(aql)
                result = list(cur)
                logger.info(f"AQL query executed successfully, got {len(result)} results")
                payload = result[0] if result else {"total": 0, "protected": 0, "unprotected": 0, "table": []}
                rows = payload.get("table", [])
                logger.info(f"Extracted {len(rows)} rows from AQL result")
            except Exception as e:
                logger.error(f"Error executing AQL query: {e}")
                import traceback
                logger.error(f"AQL traceback: {traceback.format_exc()}")
                raise
            
            logger.info(f"AQL query returned {len(rows)} resources")
            logger.info(f"Total: {payload.get('total', 0)}, Protected: {payload.get('protected', 0)}, Unprotected: {payload.get('unprotected', 0)}")
            
            # Debug: Log first few resources to see what we're getting
            if rows:
                logger.info("Sample resources from AQL:")
                for i, r in enumerate(rows[:5]):
                    logger.info(f"  Resource {i+1}: service='{r.get('service', '')}', kind='{r.get('kind', '')}', resourceId='{r.get('resourceId', '')}', status='{r.get('status', '')}'")
                
                # Count by service and kind for statistics
                service_counts = {}
                kind_counts = {}
                for r in rows:
                    service = r.get('service', 'unknown')
                    kind = r.get('kind', 'unknown')
                    service_counts[service] = service_counts.get(service, 0) + 1
                    kind_counts[kind] = kind_counts.get(kind, 0) + 1
                
                logger.info(f"Service distribution: {dict(sorted(service_counts.items(), key=lambda x: x[1], reverse=True)[:10])}")
                logger.info(f"Kind distribution: {dict(sorted(kind_counts.items(), key=lambda x: x[1], reverse=True)[:10])}")

            # Persist to Postgres assets_inventory
            logger.info("Getting database session...")
            session: Session = get_session()
            logger.info("Database session obtained successfully")
            try:
                # Resolve account UUID (force assign all scanned resources to this account)
                logger.info("Resolving account UUID...")
                acct_id = None
                if account_identifier:
                    logger.info(f"Looking up account {account_identifier}...")
                    acct = (
                        session.query(CloudAccount)
                        .filter(CloudAccount.account_identifier == account_identifier)
                        .one_or_none()
                    )
                    acct_id = acct.id if acct else None
                    logger.info(f"Account lookup for {account_identifier}: {'found' if acct_id else 'not found'}")

                # Clean existing assets for this account (if specified)
                if acct_id is not None:
                    logger.info(f"Cleaning existing assets for account {acct_id}")
                    session.execute(
                        delete(AssetsInventory).where(AssetsInventory.account_id == acct_id)
                    )
                    session.commit()

                total = 0
                protected = 0
                skipped_invalid = 0
                skipped_duplicate = 0

                logger.info(f"Processing {len(rows)} resources...")
                
                for i, r in enumerate(rows):
                    if i % 100 == 0:
                        logger.info(f"Processed {i}/{len(rows)} resources...")
                    
                    kind = str(r.get("kind", "unknown"))
                    rid = str(r.get("resourceId", ""))
                    provider = str(r.get("provider", "aws"))
                    svc = str(r.get("service", "unknown")).strip()
                    
                    # Validate resource using helper function
                    if not self.is_valid_resource(kind, rid):
                        logger.warning(f"Skipping invalid resource: kind='{kind}', id='{rid}'")
                        skipped_invalid += 1
                        continue
                    
                    # Ensure service is not empty, use helper function as fallback
                    if not svc or svc == "unknown" or svc.strip() == "":
                        svc = self.extract_service_name(kind)
                    
                    type_label = kind
                    
                    try:
                        if kind.startswith("aws_"):
                            rest = kind[4:]
                            if "_" in rest:
                                _, type_part = rest.split("_", 1)
                                type_label = f"{svc.upper()} " + type_part.replace("_", " ").title()
                            else:
                                type_label = f"{svc.upper()} {rest.replace('_', ' ').title()}"
                        elif kind.startswith("gcp_"):
                            rest = kind[4:]
                            if "_" in rest:
                                _, type_part = rest.split("_", 1)
                                type_label = f"{svc.upper()} " + type_part.replace("_", " ").title()
                            else:
                                type_label = f"{svc.upper()} {rest.replace('_', ' ').title()}"
                    except Exception as e:
                        logger.warning(f"Error processing type label for {kind}: {e}")
                        pass

                    last_backup_raw = r.get("last_backup")
                    last_backup_dt = None
                    if last_backup_raw:
                        try:
                            last_backup_dt = dateparser.parse(str(last_backup_raw))
                        except Exception as e:
                            logger.warning(f"Error parsing last_backup for {rid}: {e}")
                            last_backup_dt = None

                    # Assign ALL rows to the provided account id (fix does not include account id reliably)
                    row_account_uuid = acct_id
                    if row_account_uuid is None:
                        # Skip rows we cannot associate to an account
                        logger.warning(f"Skipping resource {rid} - no account association")
                        continue

                    # Upsert: try to find existing
                    existing = (
                        session.query(AssetsInventory)
                        .filter(
                            AssetsInventory.account_id == row_account_uuid,
                            AssetsInventory.service == svc,
                            AssetsInventory.kind == kind,
                            AssetsInventory.resource_id == rid,
                        )
                        .one_or_none()
                    )
                    
                    if existing:
                        # Update existing record
                        existing.provider = provider
                        existing.name = r.get("name") or rid
                        existing.type = type_label
                        existing.status = str(r.get("status", "unprotected"))
                        existing.region = r.get("region")
                        existing.last_backup = last_backup_dt
                        existing.tags = r.get("tags", {})
                        existing.arango_id = r.get("sourceId")
                        logger.debug(f"Updated existing asset: {svc}/{kind}/{rid}")
                    else:
                        # Create new record
                        try:
                            row = AssetsInventory(
                                account_id=row_account_uuid,
                                provider=provider,
                                service=svc,
                                kind=kind,
                                resource_id=rid,
                                name=r.get("name") or rid,
                                type=type_label,
                                status=str(r.get("status", "unprotected")),
                                region=r.get("region"),
                                last_backup=last_backup_dt,
                                tags=r.get("tags", {}),
                                arango_id=r.get("sourceId"),
                            )
                            session.add(row)
                            logger.debug(f"Added new asset: {svc}/{kind}/{rid}")
                        except Exception as e:
                            logger.error(f"Failed to add asset {svc}/{kind}/{rid}: {e}")
                            continue

                    total += 1
                    if str(r.get("status", "unprotected")) == "protected":
                        protected += 1

                logger.info(f"Committing {total} resources to database...")
                session.commit()
                
                result = {"total": int(total), "protected": int(protected), "unprotected": int(total - protected)}
                logger.info(f"Materialization completed: {result}")
                logger.info(f"Validation stats: {skipped_invalid} invalid resources skipped")
                return result
                
            except Exception as e:
                import traceback
                logger.error(f"Error during database operations: {e}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                session.rollback()
                raise
            finally:
                session.close()
                
        except Exception as e:
            logger.error(f"Error during materialization: {e}")
            return {"total": 0, "protected": 0, "unprotected": 0}

    def list_persisted(self) -> InventoryListResponse:
        return self.list()

    def list(self) -> InventoryListResponse:
        """Return assets from Postgres assets_inventory table."""
        session: Session = get_session()
        try:
            rows = session.execute(
                select(
                    AssetsInventory.id,
                    AssetsInventory.resource_id,
                    AssetsInventory.name,
                    AssetsInventory.type,
                    AssetsInventory.service,
                    AssetsInventory.status,
                    AssetsInventory.region,
                    AssetsInventory.last_backup,
                    AssetsInventory.tags,
                    AssetsInventory.account_id,
                )
            ).all()

            def norm_service(val: str) -> str:
                v = (val or "unknown").lower()
                mapping = {"ec2": "EC2", "rds": "RDS", "ebs": "EBS", "s3": "S3", "lambda": "Lambda"}
                return mapping.get(v, v.capitalize())

            items = [
                InventoryItem(
                    id=str(r.id),
                    name=str(r.name or r.resource_id or ""),
                    type=str(r.type or "unknown"),
                    service=norm_service(str(r.service or "unknown")),
                    status=str(r.status or "unprotected"),
                    region=r.region,
                    last_backup=(r.last_backup.isoformat() if r.last_backup else None),
                    tags=r.tags or {},
                    account_id=(str(r.account_id) if r.account_id else None),
                )
                for r in rows
            ]
            total = len(items)
            protected = sum(1 for i in items if i.status == "protected")
            coverage = (protected / total) if total else 0.0
            return InventoryListResponse(summary=InventorySummary(assets=total, coverage=coverage), items=items)
        finally:
            session.close()

    def list_from_arango(self) -> InventoryListResponse:
        """Return inventory list using Arango if configured.

        If the 'fix' collection exists, executes the pre-aggregation AQL the user provided
        to compute EC2/EBS protection and a unified table. Otherwise, falls back to the
        simple mock response.
        """
        db = get_db()
        try:
            if db is not None and has_collection(self.fix_collection):
                aql = f"""
                /* -------------------- 1) Pre-aggregate snapshots by volume -------------------- */
                LET snapAgg = (
                  FOR s IN {self.fix_collection}
                    FILTER 'aws_ec2_snapshot' IN s.kinds
                    COLLECT volId = s.reported.volume_id INTO grp
                    LET times = grp[*].s.reported.created_at
                    RETURN {{
                      volId,
                      count: LENGTH(grp),
                      last: MAX(times)
                    }}
                )

                LET snapByVol = MERGE(
                  FOR x IN snapAgg
                    RETURN {{ [x.volId]: {{ count: x.count, last: x.last }} }}
                )

                /* -------------------- 2) Volume rows (EBS) -------------------- */
                LET volumeRows = (
                  FOR v IN {self.fix_collection}
                    FILTER 'aws_ec2_volume' IN v.kinds

                    LET volId = v.reported.id
                    LET az = v.reported.availability_zone
                    LET region = az ? SUBSTRING(az, 0, LENGTH(az) - 1) : null

                    LET snap = snapByVol[volId]
                    LET hasSnap = snap && snap.count > 0

                    RETURN {{
                      kind: "EBS",
                      resourceId: volId,
                      name: (v.reported.tags && v.reported.tags.Name) ? v.reported.tags.Name : volId,
                      region: region,
                      status: hasSnap ? "protected" : "unprotected",
                      last_backup: snap ? snap.last : null,
                      details: {{ snapshot_count: snap ? snap.count : 0 }}
                    }}
                )

                /* -------------------- 3) Instance rows -------------------- */
                LET instanceRows = (
                  FOR v IN {self.fix_collection}
                    FILTER 'aws_ec2_volume' IN v.kinds

                    FOR att IN v.reported.volume_attachments
                      COLLECT instanceId = att.instance_id INTO grp = {{ volId: v.reported.id, az: v.reported.availability_zone }}

                      LET perVol = (
                        FOR g IN grp
                          LET snap = snapByVol[g.volId]
                          RETURN {{ volumeId: g.volId, hasSnap: snap && snap.count > 0, last: snap ? snap.last : null }}
                      )

                      LET hasAny = LENGTH(FOR x IN perVol FILTER x.hasSnap RETURN 1) > 0
                      LET lastBackup = MAX(perVol[*].last)

                      LET anyAZ = FIRST(grp).az
                      LET region = anyAZ ? SUBSTRING(anyAZ, 0, LENGTH(anyAZ) - 1) : null

                      RETURN {{
                        kind: "EC2",
                        resourceId: instanceId,
                        name: instanceId,
                        region: region,
                        status: hasAny ? "protected" : "unprotected",
                        last_backup: lastBackup,
                        details: {{ volumes: perVol }}
                      }}
                )

                /* -------------------- 4) S3 bucket rows -------------------- */
                LET s3Rows = (
                  FOR b IN {self.fix_collection}
                    FILTER 'aws_s3_bucket' IN b.kinds
                    LET name = b.reported.name || b.reported.bucket || b.reported.id
                    LET versioning = b.reported.versioning && (b.reported.versioning.status || b.reported.versioning.Status)
                    LET hasVersioning = versioning == 'Enabled' || versioning == true
                    LET hasReplication = b.reported.replication_configuration != null
                    LET region = b.reported.region
                    RETURN {{
                      kind: "S3",
                      resourceId: name,
                      name: name,
                      region: region,
                      status: (hasVersioning || hasReplication) ? "protected" : "unprotected",
                      last_backup: null,
                      details: {{ versioning: hasVersioning, replication: hasReplication }}
                    }}
                )

                /* -------------------- 5) RDS instance rows -------------------- */
                LET rdsRows = (
                  FOR r IN {self.fix_collection}
                    FILTER 'aws_rds_db_instance' IN r.kinds
                    LET id = r.reported.db_instance_identifier || r.reported.id
                    LET az = r.reported.availability_zone
                    LET region = az ? SUBSTRING(az, 0, LENGTH(az) - 1) : (r.reported.region || null)
                    LET retention = TO_NUMBER(r.reported.backup_retention_period)
                    LET hasBackups = retention != null && retention > 0
                    RETURN {{
                      kind: "RDS",
                      resourceId: id,
                      name: id,
                      region: region,
                      status: hasBackups ? "protected" : "unprotected",
                      last_backup: null,
                      details: {{ retention: retention }}
                    }}
                )

                LET table12 = APPEND(instanceRows, volumeRows)
                LET table123 = APPEND(table12, s3Rows)
                LET table = APPEND(table123, rdsRows)

                RETURN {{
                  total: LENGTH(table),
                  protected: LENGTH(FOR r IN table FILTER r.status == "protected" RETURN 1),
                  unprotected: LENGTH(FOR r IN table FILTER r.status == "unprotected" RETURN 1),
                  table: table
                }}
                """
                cur = db.aql.execute(aql)
                result = list(cur)
                payload = result[0] if result else {"total": 0, "protected": 0, "unprotected": 0, "table": []}
                rows = payload.get("table", [])

                def type_from_kind(k: str) -> str:
                    if k == "EC2":
                        return "EC2 Instance"
                    if k == "EBS":
                        return "EBS Volume"
                    if k == "S3":
                        return "S3 Bucket"
                    if k == "RDS":
                        return "RDS Instance"
                    return k

                items = [
                    InventoryItem(
                        id=str(r.get("resourceId", "")),
                        name=str(r.get("name") or r.get("resourceId", "")),
                        type=type_from_kind(str(r.get("kind", "unknown"))),
                        service=str(r.get("kind", "unknown")),
                        status=str(r.get("status", "unprotected")),
                        region=r.get("region"),
                        last_backup=r.get("last_backup") or None,
                        tags={},
                    )
                    for r in rows
                ]

                total = int(payload.get("total", len(items)))
                protected = int(payload.get("protected", sum(1 for i in items if i.status == "protected")))
                coverage = (protected / total) if total else 0.0
                return InventoryListResponse(
                    summary=InventorySummary(assets=total, coverage=coverage),
                    items=items,
                )
        except Exception:
            # fall back to mock if AQL fails
            pass

        # Fallback mock
        items = [
            InventoryItem(id="i-1", name="web-1", type="EC2 Instance", service="EC2", status="protected", region="us-east-1"),
            InventoryItem(id="vol-2", name="data-vol", type="EBS Volume", service="EBS", status="unprotected", region="us-west-2"),
        ]
        return InventoryListResponse(
            mock=True,
            summary=InventorySummary(assets=len(items), coverage=0.5),
            items=items,
        )

    def details(self) -> InventoryDetailsResponse:
        # Build minimal details from assets_inventory (no deep config yet)
        session: Session = get_session()
        try:
            rows = session.execute(
                select(
                    AssetsInventory.resource_id,
                    AssetsInventory.name,
                    AssetsInventory.service,
                    AssetsInventory.region,
                    AssetsInventory.status,
                    AssetsInventory.last_backup,
                )
            ).all()
            details = [
                InventoryDetails(
                    id=str(r.resource_id or ""),
                    description=f"{r.service} resource in {r.region or 'unknown'} ({r.status})",
                    configuration={},
                    metrics={"last_backup": (r.last_backup.isoformat() if r.last_backup else None)},
                )
                for r in rows
            ]
            return InventoryDetailsResponse(details=details)
        finally:
            session.close()
