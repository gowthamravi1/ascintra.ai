#!/usr/bin/env python3

import os
import sys
sys.path.append('/Users/gow-an/Documents/workspace/ascintra.ai/backend')

from app.db.arango import get_db

def test_simple_aql():
    """Test a simple AQL query to see if the issue is with AQL execution"""
    try:
        db = get_db()
        
        # Simple query to test basic AQL execution
        simple_aql = """
        FOR v IN fix
        LIMIT 5
        RETURN {
            _key: v._key,
            kinds: v.kinds,
            has_reported: v.reported != null
        }
        """
        
        print("Testing simple AQL query...")
        cur = db.aql.execute(simple_aql)
        result = list(cur)
        print(f"Simple query returned {len(result)} results")
        
        if result:
            print("Sample result:")
            print(result[0])
        
        return True
        
    except Exception as e:
        print(f"Error in simple AQL: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    test_simple_aql()
