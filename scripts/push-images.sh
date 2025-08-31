#!/bin/bash
# Usage: ./scripts/push-images.sh [registry] [username]
# Example: ./scripts/push-images.sh docker.io toanndcloud

set -e

echo "🚀 Docker Image Push Script"
echo "==========================="

# Get parameters
REGISTRY=${1:-"docker.io"}
USERNAME=${2}

# Get commit hash
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Show usage if username missing
if [ -z "$USERNAME" ]; then
    echo "❌ Error: Username is required"
    echo ""
    echo "Usage: $0 [registry] <username>"
    echo ""
    echo "Examples:"
    echo "  $0 docker.io myusername"
    echo "  $0 ghcr.io myusername"
    echo "  $0 myusername              # defaults to docker.io"
    echo ""
    exit 1
fi

# If only one parameter, assume it's username and use docker.io
if [ $# -eq 1 ]; then
    USERNAME=$1
    REGISTRY="docker.io"
fi

echo "Push configuration:"
echo "Registry: $REGISTRY"
echo "Username: $USERNAME"
echo "Commit Hash: $COMMIT_HASH"
echo ""

# Check Docker login
check_docker_login() {
    echo "🔐 Checking Docker authentication..."
    
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker daemon is not running"
        exit 1
    fi
    
    echo "✅ Docker is running"
    echo "💡 Make sure you're logged in: docker login $REGISTRY"
    echo ""
}

# Function to push service
push_service() {
    local service_name=$1
    local local_image="$USERNAME/$service_name"
    local remote_image="$REGISTRY/$USERNAME/$service_name"
    
    echo "📦 Processing $service_name..."
    
    # Check if local latest image exists
    if ! docker image inspect "$local_image:latest" > /dev/null 2>&1; then
        echo "❌ Local image $local_image:latest not found"
        echo "   Run: ./scripts/build-images.sh"
        return 1
    fi
    
    echo "🏷️  Tagging images..."
    
    # Tag latest for remote
    docker tag "$local_image:latest" "$remote_image:latest"
    
    # Check and tag commit hash if exists
    if docker image inspect "$local_image:$COMMIT_HASH" > /dev/null 2>&1; then
        echo "   Found commit hash tag: $COMMIT_HASH"
        docker tag "$local_image:$COMMIT_HASH" "$remote_image:$COMMIT_HASH"
        HAS_COMMIT_TAG=true
    else
        echo "   No commit hash tag found (this is okay)"
        HAS_COMMIT_TAG=false
    fi
    
    echo "🚀 Pushing to registry..."
    
    # Push latest tag
    echo "   Pushing $remote_image:latest..."
    if docker push "$remote_image:latest"; then
        echo "   ✅ Latest tag pushed"
    else
        echo "   ❌ Failed to push latest tag"
        return 1
    fi
    
    # Push commit hash if exists
    if [ "$HAS_COMMIT_TAG" = true ]; then
        echo "   Pushing $remote_image:$COMMIT_HASH..."
        if docker push "$remote_image:$COMMIT_HASH"; then
            echo "   ✅ Commit tag ($COMMIT_HASH) pushed"
        else
            echo "   ⚠️  Failed to push commit tag (non-critical)"
        fi
    fi
    
    echo "✅ $service_name pushed successfully!"
    echo ""
}

# Main execution
check_docker_login

# Services to push
SERVICES=("user-service" "order-service" "frontend")
PUSHED_SERVICES=0
FAILED_SERVICES=0

echo "🚀 Starting push process..."
echo ""

# Push each service
for service in "${SERVICES[@]}"; do
    if push_service "$service"; then
        PUSHED_SERVICES=$((PUSHED_SERVICES + 1))
    else
        FAILED_SERVICES=$((FAILED_SERVICES + 1))
        echo "❌ Failed to push $service"
        echo ""
    fi
done

# Summary
echo "📋 PUSH SUMMARY"
echo "==============="
echo "Services pushed successfully: $PUSHED_SERVICES"
echo "Services failed: $FAILED_SERVICES"
echo ""

if [ $FAILED_SERVICES -gt 0 ]; then
    echo "❌ Some services failed to push"
    echo "Check Docker login and network connection"
    exit 1
else
    echo "🎉 All services pushed successfully!"
    echo ""
    echo "🌍 Images available at:"
    for service in "${SERVICES[@]}"; do
        echo "  - $REGISTRY/$USERNAME/$service:latest"
        if [ "$COMMIT_HASH" != "unknown" ]; then
            echo "  - $REGISTRY/$USERNAME/$service:$COMMIT_HASH"
        fi
    done
    echo ""
    echo "💡 To use in Kubernetes:"
    echo "   image: $REGISTRY/$USERNAME/frontend:latest"
fi