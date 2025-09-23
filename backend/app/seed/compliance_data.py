#!/usr/bin/env python3
"""
Seed compliance frameworks and rules from the compliance-scoreboard YAML files
"""

import os
import sys
import yaml
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.db.session import get_session
from app.orm.models import ComplianceFramework, ComplianceRule
from sqlalchemy.orm import Session

def load_yaml_rules(file_path: str) -> list:
    """Load rules from YAML file"""
    try:
        with open(file_path, 'r') as f:
            data = yaml.safe_load(f)
            return data.get('rules', [])
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return []

def seed_compliance_data():
    """Seed compliance frameworks and rules"""
    session: Session = get_session()
    
    try:
        # Create SOC 2 framework
        soc2_framework = session.query(ComplianceFramework).filter(ComplianceFramework.name == "SOC 2").first()
        if not soc2_framework:
            soc2_framework = ComplianceFramework(
                name="SOC 2",
                version="Type II",
                description="SOC 2 Type II compliance framework for security, availability, processing integrity, confidentiality, and privacy",
                enabled=True
            )
            session.add(soc2_framework)
            session.flush()  # Get the ID
            print("✓ Created SOC 2 framework")
        else:
            print("✓ SOC 2 framework already exists")

        # Create DORA framework
        dora_framework = session.query(ComplianceFramework).filter(ComplianceFramework.name == "DORA").first()
        if not dora_framework:
            dora_framework = ComplianceFramework(
                name="DORA",
                version="2024",
                description="Digital Operational Resilience Act (DORA) compliance framework for ICT risk management",
                enabled=True
            )
            session.add(dora_framework)
            session.flush()  # Get the ID
            print("✓ Created DORA framework")
        else:
            print("✓ DORA framework already exists")

        # Load and create SOC 2 rules
        soc2_rules_path = Path(__file__).parent / "rules" / "soc2_rules.yaml"
        if soc2_rules_path.exists():
            soc2_rules = load_yaml_rules(str(soc2_rules_path))
            for rule_data in soc2_rules:
                existing_rule = session.query(ComplianceRule).filter(
                    ComplianceRule.framework_id == soc2_framework.id,
                    ComplianceRule.rule_id == rule_data['id']
                ).first()
                
                if not existing_rule:
                    rule = ComplianceRule(
                        framework_id=soc2_framework.id,
                        rule_id=rule_data['id'],
                        category=rule_data['category'],
                        description=rule_data['description'],
                        resource_type=rule_data['type'],
                        field_path=rule_data['field'],
                        operator='equals',
                        expected_value=rule_data['expected'],
                        severity=rule_data['severity'],
                        remediation=f"Ensure {rule_data['description'].lower()}",
                        enabled=True
                    )
                    session.add(rule)
                    print(f"  ✓ Added SOC 2 rule: {rule_data['id']}")
                else:
                    print(f"  - SOC 2 rule already exists: {rule_data['id']}")

        # Load and create DORA rules
        dora_rules_path = Path(__file__).parent / "rules" / "dora_rules.yaml"
        if dora_rules_path.exists():
            dora_rules = load_yaml_rules(str(dora_rules_path))
            for rule_data in dora_rules:
                existing_rule = session.query(ComplianceRule).filter(
                    ComplianceRule.framework_id == dora_framework.id,
                    ComplianceRule.rule_id == rule_data['id']
                ).first()
                
                if not existing_rule:
                    rule = ComplianceRule(
                        framework_id=dora_framework.id,
                        rule_id=rule_data['id'],
                        category=rule_data['category'],
                        description=rule_data['description'],
                        resource_type=rule_data['type'],
                        field_path=rule_data['field'],
                        operator='equals',
                        expected_value=rule_data['expected'],
                        severity=rule_data['severity'],
                        remediation=f"Ensure {rule_data['description'].lower()}",
                        enabled=True
                    )
                    session.add(rule)
                    print(f"  ✓ Added DORA rule: {rule_data['id']}")
                else:
                    print(f"  - DORA rule already exists: {rule_data['id']}")

        session.commit()
        print("\n✅ Compliance data seeded successfully!")
        
        # Print summary
        soc2_count = session.query(ComplianceRule).filter(ComplianceRule.framework_id == soc2_framework.id).count()
        dora_count = session.query(ComplianceRule).filter(ComplianceRule.framework_id == dora_framework.id).count()
        
        print(f"\n📊 Summary:")
        print(f"  SOC 2 rules: {soc2_count}")
        print(f"  DORA rules: {dora_count}")
        print(f"  Total rules: {soc2_count + dora_count}")

    except Exception as e:
        print(f"❌ Error seeding compliance data: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    seed_compliance_data()
