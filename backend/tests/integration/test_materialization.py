#!/usr/bin/env python3
"""
Test script for the materialization function
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

def test_materialization():
    """Test the materialization function"""
    try:
        from app.services.inventory_service import InventoryService
        from app.core.config import settings
        
        print("Testing materialization function...")
        print(f"ArangoDB URL: {settings.arango_url}")
        print(f"ArangoDB Database: {settings.arango_db}")
        print(f"Fix Collection: {settings.arango_fix_collection}")
        
        # Test with a sample account identifier
        service = InventoryService()
        result = service.materialize_assets_from_fix(account_identifier="123456789012")
        
        print(f"Materialization result: {result}")
        
        # Test listing persisted assets
        inventory = service.list_persisted()
        print(f"Inventory summary: {inventory.summary}")
        print(f"Number of items: {len(inventory.items)}")
        
        if inventory.items:
            print("Sample items:")
            for item in inventory.items[:5]:  # Show first 5 items
                print(f"  - {item.service} {item.type}: {item.name} ({item.status})")
        
        return True
        
    except Exception as e:
        print(f"Error during testing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_materialization()
    sys.exit(0 if success else 1)
