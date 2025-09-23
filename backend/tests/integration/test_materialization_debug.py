#!/usr/bin/env python3

import os
import sys
sys.path.append('/Users/gow-an/Documents/workspace/ascintra.ai/backend')

from app.db.arango import get_db
from app.services.inventory_service import InventoryService

def test_materialization_debug():
    """Test materialization with debug logging"""
    try:
        print("Testing materialization...")
        
        # Test the AQL query step by step
        db = get_db()
        
        # First, test the snapshot aggregation
        print("Testing snapshot aggregation...")
        snap_aql = """
        FOR s IN fix
        FILTER 'aws_ec2_snapshot' IN s.kinds
        LIMIT 5
        RETURN {
            volume_id: s.reported.volume_id,
            created_at: s.reported.created_at
        }
        """
        
        cur = db.aql.execute(snap_aql)
        snap_result = list(cur)
        print(f"Snapshot query returned {len(snap_result)} results")
        
        # Test the main resource query with simplified logic
        print("Testing main resource query...")
        main_aql = """
        FOR v IN fix
        LIMIT 5
        LET kinds = v.kinds || []
        LET primaryKind = FIRST(FOR k IN kinds FILTER k != null RETURN k)
        FILTER primaryKind != null
        LET resourceId = v.reported.id || v.reported.arn || v.reported.name || TO_STRING(v._key)
        FILTER resourceId != null AND resourceId != ''
        RETURN {
            _key: v._key,
            primaryKind: primaryKind,
            resourceId: resourceId,
            reported: v.reported
        }
        """
        
        cur = db.aql.execute(main_aql)
        main_result = list(cur)
        print(f"Main query returned {len(main_result)} results")
        
        if main_result:
            print("Sample result:")
            print(main_result[0])
        
        return True
        
    except Exception as e:
        print(f"Error in materialization debug: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    test_materialization_debug()
