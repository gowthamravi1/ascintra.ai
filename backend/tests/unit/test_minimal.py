#!/usr/bin/env python3

import os
import sys
sys.path.append('/Users/gow-an/Documents/workspace/ascintra.ai/backend')

def test_minimal():
    """Test minimal imports and operations"""
    try:
        print("Testing minimal imports...")
        
        # Test basic imports
        from app.core.config import settings
        print("✓ Settings imported")
        
        from app.db.arango import get_db
        print("✓ ArangoDB imported")
        
        from app.db.session import get_session
        print("✓ Database session imported")
        
        from app.orm.models import AssetsInventory, CloudAccount
        print("✓ Models imported")
        
        # Test constants
        from app.services.inventory_service import AWS_RESOURCE_TYPES, GCP_RESOURCE_TYPES, VALID_RESOURCE_TYPES
        print("✓ Constants imported")
        print(f"AWS types: {len(AWS_RESOURCE_TYPES)}")
        print(f"GCP types: {len(GCP_RESOURCE_TYPES)}")
        print(f"Valid types: {len(VALID_RESOURCE_TYPES)}")
        
        # Test class creation
        from app.services.inventory_service import InventoryService
        print("✓ InventoryService imported")
        
        service = InventoryService()
        print("✓ InventoryService created")
        
        # Test helper methods
        service_name = service.extract_service_name("aws_ec2_instance")
        print(f"✓ extract_service_name: {service_name}")
        
        is_valid = service.is_valid_resource("aws_ec2_instance", "i-123456")
        print(f"✓ is_valid_resource: {is_valid}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    test_minimal()
