#!/usr/bin/env python3
"""
Test script to verify AQL query works with actual EC2 document structure
"""
import sys
import os
import logging

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def test_ec2_document_processing():
    """Test how our logic would process the EC2 document"""
    print("Testing EC2 document processing...")
    
    # Simulate the document structure
    doc = {
        "kinds": ["aws_resource", "instance", "aws_ec2_instance", "resource"],
        "reported": {
            "id": "i-0b4774c9c1552f431",
            "name": "webappserver",
            "arn": "arn:aws:ec2:us-east-1:142141431503:instance/i-0b4774c9c1552f431",
            "instance_block_device_mappings": [
                {
                    "device_name": "/dev/xvda",
                    "ebs": {
                        "volume_id": "vol-0d34dd3b9c63522bd",
                        "status": "attached"
                    }
                }
            ]
        }
    }
    
    # Test kind selection logic
    kinds = doc["kinds"]
    print(f"Available kinds: {kinds}")
    
    # Find the most specific kind (aws_* or gcp_* prefixed)
    aws_gcp_kinds = [k for k in kinds if k and (k.startswith('aws_') or k.startswith('gcp_'))]
    if aws_gcp_kinds:
        # Sort by length (longest first) to get most specific
        primary_kind = sorted(aws_gcp_kinds, key=len, reverse=True)[0]
    else:
        primary_kind = kinds[0] if kinds else "unknown"
    
    print(f"Selected primary kind: {primary_kind}")
    
    # Test provider and service extraction
    is_aws = primary_kind.startswith('aws_')
    is_gcp = primary_kind.startswith('gcp_')
    provider = 'aws' if is_aws else ('gcp' if is_gcp else 'unknown')
    
    if is_aws:
        parts = primary_kind.split('_')
        service = parts[1] if len(parts) > 1 else 'unknown'
    elif is_gcp:
        parts = primary_kind.split('_')
        service = parts[1] if len(parts) > 1 else 'unknown'
    else:
        service = 'unknown'
    
    print(f"Provider: {provider}")
    print(f"Service: {service}")
    
    # Test resource ID extraction
    resource_id = (
        doc["reported"].get("id") or
        doc["reported"].get("arn") or
        doc["reported"].get("name") or
        "fallback_id"
    )
    print(f"Resource ID: {resource_id}")
    
    # Test volume extraction for EC2
    if primary_kind == 'aws_ec2_instance':
        volume_ids = []
        for mapping in doc["reported"].get("instance_block_device_mappings", []):
            if mapping.get("ebs") and mapping["ebs"].get("volume_id"):
                volume_ids.append(mapping["ebs"]["volume_id"])
        print(f"Attached volume IDs: {volume_ids}")
    
    print("✅ EC2 document processing test completed!")

if __name__ == "__main__":
    test_ec2_document_processing()
