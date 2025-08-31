#!/bin/bash

# Exit on any error
set -e

echo "🐳 Docker Image Build Script"
echo "============================"

# Parameters
USERNAME=${1:-"toanndcloud"}  # Default to toanndcloud if not provided

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Lấy commit hash 7 ký tự đầu
COMMIT_HASH=$(git rev-parse --short HEAD)

echo "Username: $USERNAME"
echo "Git commit hash: $COMMIT_HASH"
echo ""

# Function để kiểm tra image đã tồn tại chưa
image_exists() {
    local service_name=$1
    local tag=$2
    docker images $USERNAME/$service_name:$tag -q | grep -q .
}

# Function để build image
build_service() {
    local service_name=$1
    local context_path=$2
    
    echo "📦 Checking $service_name..."
    
    # Kiểm tra xem image với commit hash này đã tồn tại chưa
    if image_exists "$service_name" "$COMMIT_HASH"; then
        echo "✅ Image $USERNAME/$service_name:$COMMIT_HASH already exists"
        echo "🔄 Retagging as latest..."
        docker tag $USERNAME/$service_name:$COMMIT_HASH $USERNAME/$service_name:latest
        echo "   Tags: $COMMIT_HASH → latest"
        echo ""
        return 0
    fi
    
    echo "🔨 Building $service_name (new commit)..."
    
    # Check if Dockerfile exists
    if [ ! -f "$context_path/Dockerfile" ]; then
        echo "❌ Error: Dockerfile not found in $context_path"
        return 1
    fi
    
    # Build image với commit hash tag
    if docker build -t $USERNAME/$service_name:$COMMIT_HASH $context_path; then
        # Tag thành latest
        docker tag $USERNAME/$service_name:$COMMIT_HASH $USERNAME/$service_name:latest
        
        echo "✅ $service_name built successfully!"
        echo "   Image: $USERNAME/$service_name"
        echo "   Tags: $COMMIT_HASH, latest"
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

echo "🎉 Build process completed!"
echo ""
echo "📋 Current $USERNAME images:"
docker images | grep $USERNAME | head -20

echo ""
echo "💡 Summary:"
echo "   - Built with username: $USERNAME"
echo "   - If commit hash already existed: just retagged as latest"
echo "   - If new commit: built new image and tagged as latest"
echo "   - Ready to push to registry"