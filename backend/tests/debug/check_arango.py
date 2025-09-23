#!/usr/bin/env python3
"""
Check what's in the ArangoDB fix collection
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

def check_arango():
    """Check ArangoDB connection and fix collection"""
    try:
        from app.db.arango import get_db
        from app.core.config import settings
        
        print("Checking ArangoDB connection...")
        print(f"ArangoDB URL: {settings.arango_url}")
        print(f"ArangoDB Database: {settings.arango_db}")
        print(f"Fix Collection: {settings.arango_fix_collection}")
        
        db = get_db()
        if db is None:
            print("❌ No ArangoDB connection available")
            return False
        
        print("✅ ArangoDB connected successfully")
        
        # Check if fix collection exists
        collections = db.collections()
        fix_collection_exists = any(col['name'] == settings.arango_fix_collection for col in collections)
        
        if not fix_collection_exists:
            print(f"❌ Fix collection '{settings.arango_fix_collection}' not found")
            print("Available collections:")
            for col in collections:
                print(f"  - {col['name']}")
            return False
        
        print(f"✅ Fix collection '{settings.arango_fix_collection}' exists")
        
        # Count documents in fix collection
        fix_collection = db.collection(settings.arango_fix_collection)
        count = fix_collection.count()
        print(f"📊 Fix collection has {count} documents")
        
        if count > 0:
            # Get a sample document
            sample_doc = fix_collection.any()
            print("📄 Sample document:")
            print(f"  - ID: {sample_doc.get('_id')}")
            print(f"  - Kinds: {sample_doc.get('kinds', [])}")
            print(f"  - Reported keys: {list(sample_doc.get('reported', {}).keys())}")
            
            # Count by resource types
            aql = f"""
            FOR doc IN {settings.arango_fix_collection}
                LET kinds = doc.kinds || []
                LET primaryKind = FIRST(FOR k IN kinds FILTER k != null RETURN k)
                COLLECT kind = primaryKind WITH COUNT INTO count
                SORT count DESC
                RETURN {{ kind, count }}
            """
            
            result = list(db.aql.execute(aql))
            print(f"\n📈 Resource types in fix collection:")
            for item in result[:20]:  # Show top 20
                print(f"  - {item['kind']}: {item['count']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error checking ArangoDB: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = check_arango()
    sys.exit(0 if success else 1)
