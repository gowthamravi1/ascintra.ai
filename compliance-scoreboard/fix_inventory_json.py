import ast
import json
import sys

def fix_inventory(infile, outfile):
    with open(infile, "r") as f:
        content = f.read()

    try:
        data = ast.literal_eval(content)  # parse Python-style dict
        with open(outfile, "w") as out:
            json.dump(data, out, indent=2)
        print(f"✅ Fixed JSON written to {outfile}")
    except Exception as e:
        print(f"❌ Failed to parse: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python fix_inventory_json.py bad_inventory.json inventory.json")
        sys.exit(1)
    fix_inventory(sys.argv[1], sys.argv[2])

