import json
import sys

def convert_fixinventory(input_file, output_file):
    with open(input_file, "r") as f:
        data = json.load(f)

    resources = []
    for item in data:
        reported = item.get("reported", {})
        resource = {
            "id": reported.get("id", item.get("id")),
            "type": reported.get("kind", "unknown"),
            "name": reported.get("name"),
            "tags": reported.get("tags", {}),
        }

        # copy selected useful fields if they exist
        for field in [
            "public",
            "encryption_enabled",
            "backup_enabled",
            "mfa_enabled",
            "multi_region",
            "multi_az",
            "enabled",
            "has_subscriptions",
            "address_type",
            "network"
        ]:
            if field in reported:
                resource[field] = reported[field]

        resources.append(resource)

    with open(output_file, "w") as out:
        json.dump({"resources": resources}, out, indent=2)

    print(f"✅ Converted {len(resources)} resources → {output_file}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python fix_to_compliance_json.py input.json output.json")
        sys.exit(1)

    convert_fixinventory(sys.argv[1], sys.argv[2])

