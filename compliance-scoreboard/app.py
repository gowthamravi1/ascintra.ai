import json
import yaml
import streamlit as st
from collections import defaultdict

# Load inventory
with open("inventory.json") as f:
    inventory = json.load(f)

# Load rules
def load_rules(file):
    with open(file) as f:
        return yaml.safe_load(f)["rules"]

soc2_rules = load_rules("rules/soc2_rules.yaml")
dora_rules = load_rules("rules/dora_rules.yaml")

def evaluate_rules(rules, inventory):
    results = []
    for rule in rules:
        failed_resources = []
        for res in inventory.get("resources", []):
            if res.get("type") == rule["type"]:
                actual = res.get(rule["field"])
                if actual != rule["expected"]:
                    failed_resources.append(res)
        results.append({
            "id": rule["id"],
            "description": rule["description"],
            "category": rule["category"],
            "passed": len(failed_resources) == 0,
            "failed_resources": failed_resources
        })
    return results

def compute_score(results):
    total = len(results)
    passed = sum(1 for r in results if r["passed"])
    return round((passed / total) * 100, 2) if total > 0 else 0

# Streamlit UI
st.title("📊 Cloud Compliance Scoreboard")
tab1, tab2 = st.tabs(["SOC 2", "DORA"])

for tab, ruleset, name in [(tab1, soc2_rules, "SOC 2"), (tab2, dora_rules, "DORA")]:
    with tab:
        results = evaluate_rules(ruleset, inventory)
        score = compute_score(results)
        st.metric(f"{name} Compliance Score", f"{score}%")

        categories = defaultdict(list)
        for r in results:
            categories[r["category"]].append(r)

        for cat, rules in categories.items():
            cat_score = compute_score(rules)
            with st.expander(f"📂 {cat} ({cat_score}%)"):
                for r in rules:
                    if r["passed"]:
                        st.success(f"✅ {r['description']}")
                    else:
                        st.error(f"❌ {r['description']}")
                        st.json(r["failed_resources"])

