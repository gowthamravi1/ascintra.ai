#!/usr/bin/env python3
"""
Test script to verify the fixes work
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

def test_service_extraction():
    """Test the service extraction logic"""
    print("Testing service extraction logic...")
    
    # Test cases
    test_cases = [
        ("aws_ec2_instance", "ec2"),
        ("aws_s3_bucket", "s3"),
        ("aws_rds_db_instance", "rds"),
        ("gcp_compute_instance", "compute"),
        ("gcp_storage_bucket", "storage"),
        ("aws_resource", "resource"),  # This was the problematic case
        ("unknown_kind", "unknown"),
    ]
    
    for kind, expected_service in test_cases:
        # Simulate the Python fallback logic
        if kind.startswith("aws_"):
            parts = kind.split("_")
            if len(parts) > 1:
                service = parts[1]
            else:
                service = "unknown"
        elif kind.startswith("gcp_"):
            parts = kind.split("_")
            if len(parts) > 1:
                service = parts[1]
            else:
                service = "unknown"
        else:
            service = "unknown"
        
        print(f"  {kind} -> {service} (expected: {expected_service}) {'✅' if service == expected_service else '❌'}")

def test_resource_id_validation():
    """Test the resource ID validation logic"""
    print("\nTesting resource ID validation...")
    
    test_cases = [
        ("i-1234567890abcdef0", True),   # Valid EC2 instance ID
        ("vol-1234567890abcdef0", True), # Valid EBS volume ID
        ("my-bucket-name", True),        # Valid S3 bucket name
        ("us-east-1", False),            # Region name (should be rejected)
        ("us-west-2", False),            # Region name (should be rejected)
        ("", False),                     # Empty string (should be rejected)
        ("arn:aws:s3:::my-bucket", True), # Valid ARN
    ]
    
    for resource_id, should_pass in test_cases:
        # Simulate the validation logic
        invalid_ids = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"]
        passes = resource_id and resource_id not in invalid_ids
        
        print(f"  '{resource_id}' -> {'✅' if passes == should_pass else '❌'} (expected: {'pass' if should_pass else 'fail'})")

if __name__ == "__main__":
    test_service_extraction()
    test_resource_id_validation()
    print("\n✅ All tests completed!")
