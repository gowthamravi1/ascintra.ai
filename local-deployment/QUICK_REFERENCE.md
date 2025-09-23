# Quick Reference

## 🚀 Quick Start

```bash
# Start everything
./start.sh

# Stop everything
./stop.sh

# Reset everything (delete all data)
./reset.sh
```

## 📱 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application UI |
| **Backend API** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Fix Inventory** | http://localhost:8900 | Fix inventory web UI |
| **Prometheus** | http://localhost:9090 | Metrics and monitoring |

## 🔧 Common Commands

### Service Management
```bash
# Start specific services
docker-compose -f ascintra-compose.yml up -d backend
docker-compose -f fix-inventory-compose.yml up -d fixcore

# Stop specific services
docker-compose -f ascintra-compose.yml stop backend
docker-compose -f fix-inventory-compose.yml stop fixcore

# Restart services
docker-compose -f ascintra-compose.yml restart backend
```

### Viewing Logs
```bash
# All Ascintra.ai logs
docker-compose -f ascintra-compose.yml logs -f

# Specific service logs
docker-compose -f ascintra-compose.yml logs -f backend
docker-compose -f ascintra-compose.yml logs -f frontend

# Fix Inventory logs
docker-compose -f fix-inventory-compose.yml logs -f fixcore
docker-compose -f fix-inventory-compose.yml logs -f fixworker
```

### Health Checks
```bash
# Check if services are running
docker-compose -f ascintra-compose.yml ps
docker-compose -f fix-inventory-compose.yml ps

# Test API endpoints
curl http://localhost:8000/healthz
curl -k https://localhost:8900/health
```

### Database Access
```bash
# PostgreSQL (Ascintra.ai)
docker exec -it ascintra-postgres psql -U ascintra -d ascintra

# ArangoDB (Fix Inventory)
docker exec -it graphdb arangosh --server.endpoint tcp://localhost:8529
```

## 🐛 Troubleshooting

### Port Conflicts
If ports are already in use, modify the compose files:
```yaml
ports:
  - "3001:3000"  # Change external port
```

### Service Won't Start
```bash
# Check logs
docker-compose -f ascintra-compose.yml logs backend

# Check resource usage
docker stats

# Check disk space
docker system df
```

### Database Issues
```bash
# Reset database
./reset.sh

# Or manually remove volumes
docker volume rm local-deployment_ascintra_postgres_data
```

## 📊 Monitoring

### Resource Usage
```bash
# Real-time stats
docker stats

# Disk usage
docker system df

# Volume usage
docker volume ls
```

### Service Status
```bash
# All services
docker ps

# Specific compose services
docker-compose -f ascintra-compose.yml ps
docker-compose -f fix-inventory-compose.yml ps
```

## 🔄 Development Workflow

1. **Make changes** to your code
2. **Rebuild** affected services:
   ```bash
   docker-compose -f ascintra-compose.yml build backend
   docker-compose -f ascintra-compose.yml up -d backend
   ```
3. **Test** your changes
4. **View logs** if needed:
   ```bash
   docker-compose -f ascintra-compose.yml logs -f backend
   ```

## 🆘 Emergency Commands

### Force Stop Everything
```bash
docker stop $(docker ps -q)
```

### Remove All Containers
```bash
docker rm -f $(docker ps -aq)
```

### Clean Everything
```bash
docker system prune -a --volumes
```

## 📝 Notes

- First startup takes 5-10 minutes
- Fix Inventory must start before Ascintra.ai
- Data persists between restarts
- Use `./reset.sh` to start completely fresh
