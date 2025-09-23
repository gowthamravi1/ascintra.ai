#!/bin/bash

# Ascintra.ai Local Deployment Reset Script

set -e

echo "🔄 Resetting Ascintra.ai Local Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Confirm with user
echo -e "${YELLOW}⚠️  WARNING: This will delete ALL data including:${NC}"
echo "   • All cloud accounts and configurations"
echo "   • All discovered resources"
echo "   • All compliance data"
echo "   • All scan history"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_status "Reset cancelled by user"
    exit 0
fi

print_status "Stopping all services..."

# Stop all services
docker-compose -f ascintra-compose.yml down 2>/dev/null || true
docker-compose -f fix-inventory-compose.yml down 2>/dev/null || true

print_status "Removing all data volumes..."

# Remove Ascintra.ai volumes
docker volume rm local-deployment_ascintra_postgres_data 2>/dev/null || true
docker volume rm local-deployment_ascintra_pgadmin_data 2>/dev/null || true

# Remove Fix Inventory volumes
docker volume rm local-deployment_fixinventory_graphdb_data 2>/dev/null || true
docker volume rm local-deployment_fixinventory_tsdb_data 2>/dev/null || true

print_status "Removing unused Docker images..."

# Remove unused images (optional)
docker image prune -f 2>/dev/null || true

print_status "Cleaning up Docker system..."

# Clean up Docker system
docker system prune -f 2>/dev/null || true

echo ""
print_success "✅ Reset completed successfully!"
echo ""
echo "💡 To start fresh, run: ./start.sh"
echo "📚 All data has been removed and you'll start with a clean slate"
