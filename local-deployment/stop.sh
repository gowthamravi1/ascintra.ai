#!/bin/bash

# Ascintra.ai Local Deployment Stop Script

set -e

echo "🛑 Stopping Ascintra.ai Local Deployment..."

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

print_status "Stopping Ascintra.ai services..."

# Stop Ascintra.ai services
if docker-compose -f ascintra-compose.yml down; then
    print_success "Ascintra.ai services stopped successfully"
else
    print_error "Failed to stop Ascintra.ai services"
fi

print_status "Stopping Fix Inventory services..."

# Stop Fix Inventory services
if docker-compose -f fix-inventory-compose.yml down; then
    print_success "Fix Inventory services stopped successfully"
else
    print_error "Failed to stop Fix Inventory services"
fi

echo ""
print_success "✅ All services have been stopped!"
echo ""
echo "💡 To start again, run: ./start.sh"
echo "🗑️  To remove all data, run: ./reset.sh"
