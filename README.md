# Ascintra.ai - Cloud Recovery Posture Management Platform

Ascintra.ai is an advanced Cloud Recovery Posture Management (CRPM) platform that ensures enterprise resilience, compliance, and optimal recovery readiness across your entire cloud infrastructure. The platform provides comprehensive monitoring, assessment, and optimization of cloud recovery capabilities with enterprise-grade solutions.

## 🏗️ Architecture Overview

The platform consists of four main components:

- **Frontend**: Next.js 14 React application with TypeScript
- **Backend**: FastAPI Python application with PostgreSQL and ArangoDB
- **Fix Inventory**: Cloud resource discovery and inventory management system
- **Compliance Scoreboard**: Streamlit application for compliance checking

### 🔗 Integration with Fix Inventory

Ascintra.ai integrates with Fix Inventory to provide comprehensive cloud resource discovery and management:

- **Resource Discovery**: Automated discovery of AWS, GCP, and other cloud resources
- **Inventory Management**: Real-time inventory of cloud assets and their protection status
- **Configuration Tracking**: Monitor configuration changes and drift detection
- **Compliance Assessment**: Evaluate compliance against frameworks like SOC 2 and DORA

## 🚀 Key Features

### Core Capabilities
- **Recovery Posture Scoring**: Real-time assessment of cloud recovery readiness with actionable insights
- **Compliance Automation**: Automated monitoring for SOC 2 Type II, DORA, ISO 27001, and other regulatory frameworks
- **Recovery Analytics**: Advanced analytics and reporting on RTO/RPO metrics, recovery trends, and infrastructure resilience
- **Executive Dashboards**: Role-based dashboards for CISOs, CIOs, and CloudOps teams
- **Automated Testing**: Continuous recovery testing and validation
- **Configuration Drift Detection**: Monitor configuration changes that impact recovery capabilities

### Supported Cloud Providers
- **AWS**: EC2, EBS, S3, RDS, Lambda, and other services
- **GCP**: Comprehensive GCP resource support (via compliance scoreboard)

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS
- **State Management**: React hooks and context
- **Authentication**: Custom auth provider with role-based access

### Backend
- **Framework**: FastAPI 0.115.0
- **Language**: Python 3.x
- **Database**: PostgreSQL 15 (primary), ArangoDB 3.11 (graph data)
- **ORM**: SQLAlchemy 2.0 with Alembic migrations
- **Authentication**: Custom implementation
- **API Documentation**: Auto-generated OpenAPI/Swagger

### Compliance Scoreboard
- **Framework**: Streamlit
- **Purpose**: GCP inventory compliance checking
- **Features**: JSON processing, compliance rule validation

## 📁 Project Structure

```
ascintra.ai/
├── frontend/                 # Next.js React application
│   ├── app/                 # App Router pages
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── tenant/          # Tenant-specific pages
│   │   └── api/             # API proxy routes
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities and auth
│   └── types/               # TypeScript type definitions
├── backend/                 # FastAPI Python application
│   ├── app/
│   │   ├── controllers/     # API route handlers
│   │   ├── models/          # Pydantic models
│   │   ├── services/        # Business logic
│   │   ├── orm/             # SQLAlchemy models
│   │   └── db/              # Database connections
│   └── alembic/             # Database migrations
├── compliance-scoreboard/   # Streamlit compliance app
├── local-deployment/        # 🎯 Complete local setup with Fix Inventory
│   ├── fix-inventory-compose.yml  # Fix Inventory services
│   ├── ascintra-compose.yml       # Ascintra.ai services
│   ├── start.sh                   # Automated startup script
│   ├── stop.sh                    # Clean shutdown script
│   ├── reset.sh                   # Complete reset script
│   ├── README.md                  # Detailed setup instructions
│   └── QUICK_REFERENCE.md         # Quick command reference
└── docker-compose.yml       # Basic multi-service orchestration
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)

### 🎯 Recommended: Local Deployment with Fix Inventory

For the complete Ascintra.ai experience with cloud resource discovery and inventory management, use our integrated local deployment:

```bash
# Navigate to the local deployment folder
cd local-deployment

# Start everything with one command (includes Fix Inventory)
./start.sh
```

**✅ What this includes:**
- Ascintra.ai application (Frontend + Backend + Database)
- Fix Inventory services (ArangoDB + Fix Core + Fix Worker)
- Automated health checks and service readiness
- Complete cloud resource discovery capabilities

**📱 Access URLs:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Fix Inventory**: http://localhost:8900
- **Prometheus**: http://localhost:9090

**🔧 Management Commands:**
```bash
./start.sh    # Start everything
./stop.sh     # Stop everything
./reset.sh    # Reset everything (delete all data)
```

### Alternative: Basic Setup (Ascintra.ai Only)

If you only need the core Ascintra.ai application without Fix Inventory:

```bash
# Start all services (compliance data seeds automatically)
docker-compose up -d
```

**✅ Automatic Setup**: The backend automatically runs database migrations and seeds compliance data on startup. No additional commands needed!

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ascintra.ai
   ```

2. **Choose your setup:**
   
   **Option A: Complete Setup (Recommended)**
   ```bash
   cd local-deployment
   ./start.sh
   ```
   
   **Option B: Basic Setup**
   ```bash
   docker-compose up -d
   ```

3. **Access the applications**
- Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - PgAdmin: http://localhost:5050 (admin@example.com / admin)

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Compliance Scoreboard Setup
```bash
cd compliance-scoreboard
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

## 🔧 Configuration

### Environment Variables

#### Backend Configuration
```bash
# ArangoDB Configuration
ARANGO_URL=http://localhost:8529
ARANGO_DB=ascintra
ARANGO_USER=ascintra
ARANGO_PASSWORD=changeme
ARANGO_INVENTORY_COLLECTION=inventory
ARANGO_FIX_COLLECTION=fix

# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ascintra
POSTGRES_USER=ascintra
POSTGRES_PASSWORD=ascintra
```

### Database Setup

1. **PostgreSQL**: Automatically created via Docker Compose
2. **ArangoDB**: Configure separately or use the commented section in docker-compose.yml
3. **Migrations & Seeding**: ✅ **Automatic** - Database migrations and compliance data seeding happen automatically when the backend container starts
   The startup process includes:
   - Database migrations (`alembic upgrade head`)
   - Compliance framework creation (SOC 2, DORA)
   - Compliance rules seeding from YAML files
   - FastAPI server startup

   **Manual Re-seeding** (if needed):
   ```bash
   docker-compose exec backend python -c "
   import sys
   sys.path.append('/app')
   from app.db.session import get_session
   from app.orm.models import ComplianceFramework, ComplianceRule
   from sqlalchemy.orm import Session
   import yaml
   from pathlib import Path

   def load_yaml_rules(file_path: str) -> list:
       try:
           with open(file_path, 'r') as f:
               data = yaml.safe_load(f)
               return data.get('rules', [])
       except Exception as e:
           print(f'Error loading {file_path}: {e}')
           return []

   session = get_session()
   try:
       # Create SOC 2 framework
       soc2_framework = session.query(ComplianceFramework).filter(ComplianceFramework.name == 'SOC 2').first()
       if not soc2_framework:
           soc2_framework = ComplianceFramework(
               name='SOC 2',
               version='Type II',
               description='SOC 2 Type II compliance framework for security, availability, processing integrity, confidentiality, and privacy',
               enabled=True
           )
           session.add(soc2_framework)
           session.commit()
           print('✓ Created SOC 2 framework')
       else:
           print('✓ SOC 2 framework already exists')

       # Create DORA framework
       dora_framework = session.query(ComplianceFramework).filter(ComplianceFramework.name == 'DORA').first()
       if not dora_framework:
           dora_framework = ComplianceFramework(
               name='DORA',
               version='2024',
               description='Digital Operational Resilience Act (DORA) compliance framework for ICT risk management',
               enabled=True
           )
           session.add(dora_framework)
           session.commit()
           print('✓ Created DORA framework')
       else:
           print('✓ DORA framework already exists')

       # Load and create SOC 2 rules
       soc2_rules_path = '/app/app/seed/rules/soc2_rules.yaml'
       soc2_rules = load_yaml_rules(soc2_rules_path)
       print(f'\\nLoading {len(soc2_rules)} SOC 2 rules...')
       
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
                   field_path=f'reported.{rule_data[\"field\"]}',
                   operator='equals',
                   expected_value=rule_data['expected'],
                   severity=rule_data['severity'],
                   remediation=f'Ensure {rule_data[\"description\"]}',
                   enabled=True
               )
               session.add(rule)
               print(f'  ✓ Added SOC 2 rule: {rule_data[\"id\"]}')
           else:
               print(f'  - SOC 2 rule already exists: {rule_data[\"id\"]}')
       
       # Load and create DORA rules
       dora_rules_path = '/app/app/seed/rules/dora_rules.yaml'
       dora_rules = load_yaml_rules(dora_rules_path)
       print(f'\\nLoading {len(dora_rules)} DORA rules...')
       
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
                   field_path=f'reported.{rule_data[\"field\"]}',
                   operator='equals',
                   expected_value=rule_data['expected'],
                   severity=rule_data['severity'],
                   remediation=f'Ensure {rule_data[\"description\"]}',
                   enabled=True
               )
               session.add(rule)
               print(f'  ✓ Added DORA rule: {rule_data[\"id\"]}')
           else:
               print(f'  - DORA rule already exists: {rule_data[\"id\"]}')

       session.commit()
       print('\\n✅ Compliance rules seeded successfully!')
       
       # Print summary
       soc2_count = session.query(ComplianceRule).filter(ComplianceRule.framework_id == soc2_framework.id).count()
       dora_count = session.query(ComplianceRule).filter(ComplianceRule.framework_id == dora_framework.id).count()
       
       print(f'\\n📊 Summary:')
       print(f'  SOC 2 rules: {soc2_count}')
       print(f'  DORA rules: {dora_count}')
       print(f'  Total rules: {soc2_count + dora_count}')

   except Exception as e:
       print(f'❌ Error seeding compliance rules: {e}')
       session.rollback()
       import traceback
       traceback.print_exc()
   finally:
       session.close()
   "

   # Alternative: Using the seed script directly (if running locally)
   # cd backend
   # python app/seed/compliance_data.py
   ```

   **Quick Seed Command** (if services are already running):
   ```bash
   # Simple one-liner to seed compliance data
   docker-compose exec backend python -c "import sys; sys.path.append('/app'); exec(open('/app/app/seed/compliance_data.py').read())"
   ```

## 📊 API Endpoints

### Core APIs

#### Accounts Management
- `POST /api/accounts` - Create cloud account
- `GET /api/accounts` - List accounts
- `GET /api/accounts/{id}` - Get account details
- `POST /api/accounts/test-connection` - Test account connection

#### Discovery & Scanning
- `GET /api/tenant/discovery/history` - List discovery scans
- `GET /api/tenant/discovery/history/{scan_id}` - Get scan details
- `POST /api/tenant/discovery/history/scan/{account_id}` - Trigger scan

#### Inventory Management
- `GET /api/tenant/inventory` - List assets inventory
- `GET /api/tenant/inventory/coverage` - Get coverage statistics
- `GET /api/tenant/inventory/details/{resource_id}` - Get asset details

#### Posture Assessment
- `GET /api/tenant/posture/scorecard` - Get recovery posture scorecard

#### Compliance Management
- `GET /api/compliance/frameworks` - List compliance frameworks
- `GET /api/compliance/frameworks/{id}` - Get framework details
- `GET /api/compliance/rules` - List compliance rules
- `GET /api/compliance/rules/{id}` - Get rule details
- `POST /api/compliance/evaluate` - Run compliance evaluation
- `POST /api/compliance/evaluate/rule` - Evaluate specific rule
- `GET /api/compliance/dashboard/{account_id}` - Get compliance dashboard
- `GET /api/compliance/scores/{account_id}` - Get compliance scores

### API Documentation
Visit http://localhost:8000/docs for interactive API documentation.

## 🎯 Key Modules

### Frontend Modules

#### Admin Dashboard
- User management and roles
- System configuration
- Billing and usage tracking
- Service operations monitoring

#### Tenant Dashboard
- **Overview**: Executive summary and key metrics
- **Discovery**: Cloud account connection and scanning (integrated with Fix Inventory)
- **Inventory**: Asset management and coverage analysis (powered by Fix Inventory)
- **Posture**: Recovery scoring and compliance tracking
- **Compliance**: Audit trails and policy management
- **Drift**: Configuration change monitoring (Fix Inventory integration)
- **Recovery Testing**: Backup validation and testing
- **AI Assistant**: Intelligent recommendations and support

### Local Deployment Workflow

#### Complete Setup (Recommended)
1. **Start Fix Inventory Services**: ArangoDB, Fix Core, Fix Worker, Fix Metrics
2. **Start Ascintra.ai Services**: Frontend, Backend, PostgreSQL
3. **Connect Cloud Accounts**: Add AWS/GCP credentials through the UI
4. **Run Discovery Scans**: Discover and inventory cloud resources
5. **Monitor Compliance**: Evaluate resources against compliance frameworks
6. **Track Drift**: Monitor configuration changes over time

### Backend Services

#### Account Service
- Cloud provider account management
- Credential storage and validation
- Connection testing and monitoring

#### Discovery Service
- Automated cloud resource discovery
- Scan scheduling and execution
- Resource inventory materialization

#### Inventory Service
- Asset catalog management
- Protection status assessment
- Coverage analysis and reporting

#### Posture Service
- Recovery posture scoring
- Compliance framework assessment
- Risk analysis and recommendations

#### Compliance Service
- Compliance framework management (SOC 2, DORA)
- Rule evaluation and scoring
- Compliance dashboard and reporting

## 🔒 Security Features

- Role-based access control (Admin/User roles)
- Secure credential storage
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Database connection security

## 📈 Monitoring & Observability

- Health check endpoints (`/healthz`)
- Comprehensive logging
- Database query monitoring
- API performance tracking
- Error handling and reporting

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Local Development Deployment

**🎯 Recommended: Complete Local Setup**
```bash
cd local-deployment
./start.sh
```

This includes:
- Ascintra.ai application
- Fix Inventory services
- Automated health checks
- Complete cloud resource discovery

**📚 Documentation**: See `local-deployment/README.md` for detailed instructions

### Production Considerations
- Configure production database credentials
- Set up proper SSL/TLS certificates
- Configure reverse proxy (nginx)
- Set up monitoring and alerting
- Configure backup strategies

### Docker Production Build
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Documentation: Check the `/docs` endpoint
- Issues: Create GitHub issues for bugs and feature requests
- Contact: [Contact information]

## 🔄 Roadmap

- [ ] Enhanced GCP support
- [ ] Azure cloud provider integration
- [ ] Advanced compliance frameworks
- [ ] Machine learning-powered insights
- [ ] Mobile application
- [ ] Advanced reporting and analytics
- [ ] Multi-tenant architecture improvements

---

**Ascintra.ai** - Securing your cloud recovery posture for enterprise resilience and compliance.