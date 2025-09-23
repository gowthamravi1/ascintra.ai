#!/bin/bash

# Ascintra.ai Local Deployment Startup Script

set -e

echo "🚀 Starting Ascintra.ai Local Deployment..."

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    print_error "docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

print_status "Starting Fix Inventory services..."

# Start Fix Inventory services
if docker-compose -f fix-inventory-compose.yml up -d; then
    print_success "Fix Inventory services started successfully"
else
    print_error "Failed to start Fix Inventory services"
    exit 1
fi

print_status "Waiting for Fix Inventory services to be ready..."
sleep 10

# Check if Fix services are healthy
print_status "Checking Fix Inventory service health..."

# Wait for fixcore to be ready
for i in {1..30}; do
    if docker exec fixcore curl -k -s https://localhost:8900/health > /dev/null 2>&1; then
        print_success "Fix Core is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Fix Core is taking longer than expected to start"
    fi
    sleep 2
done

print_status "Starting Ascintra.ai application services..."

# Start Ascintra.ai services
if docker-compose -f ascintra-compose.yml up -d; then
    print_success "Ascintra.ai services started successfully"
else
    print_error "Failed to start Ascintra.ai services"
    exit 1
fi

print_status "Waiting for Ascintra.ai services to be ready..."
sleep 15

# Check if Ascintra services are healthy
print_status "Checking Ascintra.ai service health..."

# Wait for backend to be ready
for i in {1..30}; do
    if curl -s http://localhost:8000/healthz > /dev/null 2>&1; then
        print_success "Backend is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Backend is taking longer than expected to start"
    fi
    sleep 2
done

# Wait for frontend to be ready
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Frontend is taking longer than expected to start"
    fi
    sleep 2
done

echo ""
print_success "🎉 All services are now running!"
echo ""
echo "📱 Access your applications:"
echo "   • Frontend:     http://localhost:3000"
echo "   • Backend API:  http://localhost:8000"
echo "   • API Docs:     http://localhost:8000/docs"
echo "   • Fix Inventory: http://localhost:8900"
echo "   • Prometheus:   http://localhost:9090"
echo ""
echo "🔧 Useful commands:"
echo "   • View logs:    docker-compose -f ascintra-compose.yml logs -f"
echo "   • Stop all:     docker-compose -f ascintra-compose.yml down && docker-compose -f fix-inventory-compose.yml down"
echo "   • Restart:      ./start.sh"
echo ""
print_status "Happy coding! 🚀"
