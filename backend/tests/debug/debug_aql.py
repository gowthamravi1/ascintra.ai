#!/usr/bin/env python3
"""
Debug script to examine AQL query results
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

def debug_aql():
    """Debug the AQL query to see what's being returned"""
    try:
        from app.db.arango import get_db
        from app.core.config import settings
        
        print("Debugging AQL query...")
        print(f"ArangoDB URL: {settings.arango_url}")
        print(f"ArangoDB Database: {settings.arango_db}")
        print(f"Fix Collection: {settings.arango_fix_collection}")
        
        db = get_db()
        if db is None:
            print("❌ No ArangoDB connection available")
            return False
        
        print("✅ ArangoDB connected successfully")
        
        # Run a simplified AQL query to see what we get
        aql = f"""
        FOR v IN {settings.arango_fix_collection}
            LIMIT 10
            LET kinds = v.kinds || []
            LET primaryKind = FIRST(FOR k IN kinds FILTER k != null RETURN k)
            FILTER primaryKind != null
            
            /* Determine provider and service */
            LET isAws = LIKE(primaryKind, 'aws_%', true)
            LET isGcp = LIKE(primaryKind, 'gcp_%', true)
            LET provider = isAws ? 'aws' : (isGcp ? 'gcp' : 'unknown')
            
            /* Extract service name from kind */
            LET serviceName = (
              isAws ? (
                LET pos = POSITION(primaryKind, '_', 4)
                RETURN pos > 0 ? SUBSTRING(primaryKind, 4, pos - 4) : 'unknown'
              ) :
              isGcp ? (
                LET pos = POSITION(primaryKind, '_', 4)
                RETURN pos > 0 ? SUBSTRING(primaryKind, 4, pos - 4) : 'unknown'
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
              TO_STRING(v._key)
            )
            
            RETURN {{
              primaryKind: primaryKind,
              provider: provider,
              serviceName: serviceName,
              resourceId: resourceId,
              reported_id: v.reported.id,
              reported_name: v.reported.name,
              reported_arn: v.reported.arn,
              arango_key: v._key
            }}
        """
        
        print("Executing debug AQL query...")
        cur = db.aql.execute(aql)
        results = list(cur)
        
        print(f"Found {len(results)} sample resources:")
        for i, r in enumerate(results):
            print(f"\n--- Resource {i+1} ---")
            print(f"Primary Kind: {r.get('primaryKind')}")
            print(f"Provider: {r.get('provider')}")
            print(f"Service Name: '{r.get('serviceName')}'")
            print(f"Resource ID: '{r.get('resourceId')}'")
            print(f"Reported ID: {r.get('reported_id')}")
            print(f"Reported Name: {r.get('reported_name')}")
            print(f"Reported ARN: {r.get('reported_arn')}")
            print(f"Arango Key: {r.get('arango_key')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during debug: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = debug_aql()
    sys.exit(0 if success else 1)
