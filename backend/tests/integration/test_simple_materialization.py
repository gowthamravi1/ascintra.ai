#!/usr/bin/env python3

import os
import sys
sys.path.append('/Users/gow-an/Documents/workspace/ascintra.ai/backend')

from app.db.arango import get_db

def test_simple_materialization():
    """Test simplified materialization"""
    try:
        print("Testing simplified materialization...")
        db = get_db()
        
        # Simplified AQL query
        aql = """
        FOR v IN fix
        LIMIT 10
        LET kinds = v.kinds || []
        LET primaryKind = (
          FIRST(FOR k IN kinds 
            FILTER k != null AND (LIKE(k, 'aws_%', true) OR LIKE(k, 'gcp_%', true))
            SORT LENGTH(k) DESC
            RETURN k
          ) ||
          FIRST(FOR k IN kinds FILTER k != null RETURN k)
        )
        FILTER primaryKind != null
        
        LET isAws = LIKE(primaryKind, 'aws_%', true)
        LET isGcp = LIKE(primaryKind, 'gcp_%', true)
        LET provider = isAws ? 'aws' : (isGcp ? 'gcp' : 'unknown')
        
        LET serviceName = (
          isAws ? (
            LET pos = POSITION(primaryKind, '_', 4)
            LET extracted = pos > 0 ? SUBSTRING(primaryKind, 4, pos - 4) : null
            RETURN extracted != null && LENGTH(extracted) > 0 ? extracted : 'unknown'
          ) :
          isGcp ? (
            LET pos = POSITION(primaryKind, '_', 4)
            LET extracted = pos > 0 ? SUBSTRING(primaryKind, 4, pos - 4) : null
            RETURN extracted != null && LENGTH(extracted) > 0 ? extracted : 'unknown'
          ) :
          'unknown'
        )
        
        LET resourceId = (
          v.reported.id || 
          v.reported.arn || 
          v.reported.name || 
          v.reported.bucket || 
          v.reported.db_instance_identifier ||
          v.reported.instance_id ||
          CONCAT(primaryKind, '_', TO_STRING(v._key))
        )
        
        FILTER resourceId != null AND resourceId != ''
        
        LET resourceName = (
          v.reported.name || 
          (v.reported.tags && v.reported.tags.Name) || 
          v.reported.bucket || 
          v.reported.db_instance_identifier ||
          v.reported.instance_id ||
          resourceId
        )
        
        LET region = v.reported.region || v.reported.placement_availability_zone || 'unknown'
        LET protectionStatus = 'unprotected'
        LET lastBackup = null
        LET tags = v.reported.tags || {}
        
        RETURN {
          sourceId: v._id,
          kind: primaryKind,
          service: serviceName,
          resourceId: resourceId,
          name: resourceName,
          provider: provider,
          status: protectionStatus,
          region: region,
          lastBackup: lastBackup,
          tags: tags
        }
        """
        
        print("Executing simplified AQL query...")
        cur = db.aql.execute(aql)
        result = list(cur)
        print(f"Query returned {len(result)} results")
        
        if result:
            print("Sample result:")
            print(result[0])
            print(f"Service type: {type(result[0].get('service'))}")
            print(f"Service value: {result[0].get('service')}")
        
        return True
        
    except Exception as e:
        print(f"Error in simplified materialization: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    test_simple_materialization()
