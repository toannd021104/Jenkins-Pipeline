#!/bin/bash

# Exit on any error
set -e

echo "🐳 Docker Image Build Script"
echo "============================"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# 1. Lấy version từ parameter đầu tiên, nếu không có thì dùng "latest"
VERSION=${1:-"latest"}

# 2. Lấy commit hash 7 ký tự đầu (dùng đề đặt tag cho docker image theo commit hash)
COMMIT_HASH=$(git rev-parse --short HEAD)

echo "Building with version: $VERSION"
echo "Git commit hash: $COMMIT_HASH"
echo ""

# Function để build image
build_service() {
    local service_name=$1
    local context_path=$2
    
    echo "📦 Building $service_name..."
    
    # Check if Dockerfile exists
    if [ ! -f "$context_path/Dockerfile" ]; then
        echo "❌ Error: Dockerfile not found in $context_path"
        return 1
    fi
    
    # Build image
    if docker build -t microservices/$service_name:$VERSION $context_path; then
        # Tag additional versions
        docker tag microservices/$service_name:$VERSION microservices/$service_name:$COMMIT_HASH
        docker tag microservices/$service_name:$VERSION microservices/$service_name:latest
        
        echo "✅ $service_name built successfully!"
        echo "   Tags: $VERSION, $COMMIT_HASH, latest"
    else
        echo "❌ Failed to build $service_name"
        return 1
    fi
    echo ""
}

# Build all services
echo "🚀 Starting build process..."
echo ""

build_service "user-service" "./services/user-service"
build_service "order-service" "./services/order-service"
build_service "frontend" "./frontend"

echo "🎉 All images built successfully!"
echo ""
echo "📋 Built images:"
docker images | grep microservices | head -10