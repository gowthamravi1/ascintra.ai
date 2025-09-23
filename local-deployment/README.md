# Local Deployment Guide

This folder contains the Docker Compose configurations needed to run the Ascintra.ai application locally with Fix Inventory integration.

## Overview

The local deployment consists of two main components:

1. **Fix Inventory** (`fix-inventory-compose.yml`) - The underlying inventory and discovery system
2. **Ascintra.ai Application** (`ascintra-compose.yml`) - The main application with frontend, backend, and database

## Prerequisites

- Docker and Docker Compose installed
- At least 8GB RAM available for Docker
- Ports 3000, 8000, 5432, 8529, 8900, 9090, 9955, 9956 available

## Quick Start

### 1. Start Fix Inventory Services

```bash
# Navigate to the local-deployment folder
cd local-deployment

# Start Fix Inventory services
docker-compose -f fix-inventory-compose.yml up -d

# Wait for services to be ready (this may take 2-3 minutes)
docker-compose -f fix-inventory-compose.yml logs -f
```

### 2. Start Ascintra.ai Application

```bash
# In a new terminal, start the main application
docker-compose -f ascintra-compose.yml up -d

# Wait for services to be ready
docker-compose -f ascintra-compose.yml logs -f
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Fix Inventory Web UI**: http://localhost:8900
- **Prometheus**: http://localhost:9090

## Service Details

### Fix Inventory Services

| Service | Port | Description |
|---------|------|-------------|
| `graphdb` | 8529 | ArangoDB database |
| `fixcore` | 8900 | Fix core API service |
| `fixworker` | 9956 | Fix worker service |
| `fixmetrics` | 9955 | Fix metrics service |
| `fixshell` | - | Fix shell for commands |
| `tsdb` | 9090 | Prometheus time series DB |

### Ascintra.ai Services

| Service | Port | Description |
|---------|------|-------------|
| `ascintra-frontend` | 3000 | Next.js frontend application |
| `ascintra-backend` | 8000 | FastAPI backend service |
| `ascintra-postgres` | 5432 | PostgreSQL database |
| `ascintra-pgadmin` | 5050 | PostgreSQL admin interface |

## Configuration

### Environment Variables

The Fix Inventory services use the following environment variables:

- `PSK` - Pre-shared key for service communication
- `FIX_VERBOSE` - Enable verbose logging
- `FIX_LOG_TEXT` - Use text logging format
- `FIXCORE_ANALYTICS_OPT_OUT` - Opt out of analytics
- `FIXCORE_GRAPHDB_PASSWORD` - Database password (default: changeme)

### AWS Credentials (Optional)

If you want to use AWS credentials with Fix Inventory:

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_SESSION_TOKEN=your_session_token  # if using temporary credentials
```

## Usage Workflow

### 1. Initial Setup

1. Start Fix Inventory services first
2. Wait for all services to be healthy
3. Start Ascintra.ai application
4. Access the frontend at http://localhost:3000

### 2. Adding Cloud Accounts

1. Navigate to **Discovery** → **Connect Account**
2. Choose your cloud provider (AWS/GCP)
3. Enter your credentials
4. Test the connection
5. Complete the account setup

### 3. Running Discovery Scans

1. Go to **Discovery** → **History**
2. Trigger a new scan for your account
3. Monitor the scan progress
4. View discovered resources in **Inventory**

### 4. Viewing Data

- **Overview**: Dashboard with key metrics
- **Inventory**: Discovered cloud resources
- **Compliance**: Compliance status and policies
- **Drift**: Configuration drift detection

## Troubleshooting

### Common Issues

#### Services Not Starting

```bash
# Check service status
docker-compose -f fix-inventory-compose.yml ps
docker-compose -f ascintra-compose.yml ps

# View logs
docker-compose -f fix-inventory-compose.yml logs
docker-compose -f ascintra-compose.yml logs
```

#### Port Conflicts

If you have port conflicts, modify the port mappings in the compose files:

```yaml
ports:
  - "3001:3000"  # Change external port to 3001
```

#### Database Connection Issues

```bash
# Check database connectivity
docker exec ascintra-postgres pg_isready -U ascintra
docker exec graphdb arangosh --server.endpoint tcp://localhost:8529
```

#### Fix Inventory Not Responding

```bash
# Check Fix services
docker exec fixcore curl -k https://localhost:8900/health
docker exec fixworker curl -k https://localhost:9956/health
```

### Reset Everything

To start fresh:

```bash
# Stop all services
docker-compose -f ascintra-compose.yml down
docker-compose -f fix-inventory-compose.yml down

# Remove volumes (WARNING: This will delete all data)
docker volume rm local-deployment_fixinventory_graphdb_data
docker volume rm local-deployment_fixinventory_tsdb_data
docker volume rm local-deployment_ascintra_postgres_data

# Start again
docker-compose -f fix-inventory-compose.yml up -d
docker-compose -f ascintra-compose.yml up -d
```

## Development

### Making Changes

1. Make your code changes in the main project
2. Rebuild the affected services:
   ```bash
   docker-compose -f ascintra-compose.yml build backend
   docker-compose -f ascintra-compose.yml up -d backend
   ```

### Debugging

#### Backend Logs
```bash
docker-compose -f ascintra-compose.yml logs -f backend
```

#### Frontend Logs
```bash
docker-compose -f ascintra-compose.yml logs -f frontend
```

#### Fix Inventory Logs
```bash
docker-compose -f fix-inventory-compose.yml logs -f fixcore
docker-compose -f fix-inventory-compose.yml logs -f fixworker
```

## Monitoring

### Health Checks

- **Backend**: http://localhost:8000/healthz
- **Frontend**: http://localhost:3000
- **Fix Core**: http://localhost:8900/health
- **Prometheus**: http://localhost:9090/targets

### Resource Usage

```bash
# Check resource usage
docker stats

# Check disk usage
docker system df
```

## Support

For issues or questions:

1. Check the logs first
2. Verify all services are running
3. Check port availability
4. Review the troubleshooting section above

## Notes

- The first startup may take 5-10 minutes as Docker downloads images and initializes databases
- Fix Inventory services must be running before starting the Ascintra.ai application
- Data persists between restarts using Docker volumes
- The setup includes all necessary services for a complete local development environment
