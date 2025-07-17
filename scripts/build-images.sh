#!/bin/bash

# Build script for Docker images
set -e

echo "🐳 Building Docker images for microservices..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get version from package.json or use default
VERSION=${1:-"latest"}
print_status "Building images with version: $VERSION"

# Build User Service
print_status "Building User Service..."
if docker build -t microservices/user-service:$VERSION ./services/user-service; then
    print_status "✅ User Service built successfully"
else
    print_error "❌ Failed to build User Service"
    exit 1
fi

# Build Order Service
print_status "Building Order Service..."
if docker build -t microservices/order-service:$VERSION ./services/order-service; then
    print_status "✅ Order Service built successfully"
else
    print_error "❌ Failed to build Order Service"
    exit 1
fi

# Build Frontend
print_status "Building Frontend..."
if docker build -t microservices/frontend:$VERSION ./frontend; then
    print_status "✅ Frontend built successfully"
else
    print_error "❌ Failed to build Frontend"
    exit 1
fi

print_status "🎉 All images built successfully!"

# Show built images
print_status "Built images:"
docker images | grep microservices

# Optional: Test images
if [ "$2" = "--test" ]; then
    print_status "🧪 Testing images..."
    
    # Test User Service
    print_status "Testing User Service..."
    docker run --rm -d --name test-user-service -p 3001:3001 microservices/user-service:$VERSION
    sleep 5
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_status "✅ User Service health check passed"
    else
        print_warning "⚠️ User Service health check failed"
    fi
    docker stop test-user-service
    
    # Test Order Service
    print_status "Testing Order Service..."
    docker run --rm -d --name test-order-service -p 3002:3002 microservices/order-service:$VERSION
    sleep 5
    if curl -f http://localhost:3002/health > /dev/null 2>&1; then
        print_status "✅ Order Service health check passed"
    else
        print_warning "⚠️ Order Service health check failed"
    fi
    docker stop test-order-service
    
    print_status "🧪 Image testing completed"
fi

print_status "🚀 Ready to deploy with: docker-compose up"