#!/bin/bash

# TechPulse Production Deployment Script
set -e

echo "🚀 Starting TechPulse Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="techpulse"
DOCKER_REGISTRY="your-registry.com"
VERSION=${1:-latest}

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  Project: $PROJECT_NAME"
echo "  Version: $VERSION"
echo "  Registry: $DOCKER_REGISTRY"

# Check if required files exist
echo -e "${BLUE}🔍 Checking required files...${NC}"
required_files=(
    "docker-compose.production.yml"
    "nginx.production.conf"
    "env.production.example"
    "backend/Dockerfile.production"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Required file missing: $file${NC}"
        exit 1
    fi
done

# Check if production environment file exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  Production environment file not found.${NC}"
    echo "Please create .env.production from env.production.example"
    echo "cp env.production.example .env.production"
    exit 1
fi

# Load environment variables
echo -e "${BLUE}🔧 Loading environment variables...${NC}"
export $(cat .env.production | grep -v '^#' | xargs)

# Build and push Docker images
echo -e "${BLUE}🐳 Building and pushing Docker images...${NC}"

# Build backend image
echo "Building backend image..."
docker build -f backend/Dockerfile.production -t $DOCKER_REGISTRY/$PROJECT_NAME-backend:$VERSION ./backend
docker push $DOCKER_REGISTRY/$PROJECT_NAME-backend:$VERSION

# Update docker-compose with registry images
echo -e "${BLUE}📝 Updating docker-compose with registry images...${NC}"
sed "s|image: mysql:8.0|image: $DOCKER_REGISTRY/$PROJECT_NAME-mysql:$VERSION|g" docker-compose.production.yml > docker-compose.production.updated.yml
sed -i "s|build:|image: $DOCKER_REGISTRY/$PROJECT_NAME-backend:$VERSION|g" docker-compose.production.updated.yml

# Deploy to production server
echo -e "${BLUE}🚀 Deploying to production server...${NC}"

# Copy files to production server (replace with your server details)
PRODUCTION_SERVER="your-production-server.com"
PRODUCTION_USER="ubuntu"
PRODUCTION_PATH="/opt/techpulse"

echo "Copying files to production server..."
scp docker-compose.production.updated.yml $PRODUCTION_USER@$PRODUCTION_SERVER:$PRODUCTION_PATH/docker-compose.yml
scp nginx.production.conf $PRODUCTION_USER@$PRODUCTION_SERVER:$PRODUCTION_PATH/
scp .env.production $PRODUCTION_USER@$PRODUCTION_SERVER:$PRODUCTION_PATH/.env

# Deploy on production server
echo "Deploying on production server..."
ssh $PRODUCTION_USER@$PRODUCTION_SERVER << EOF
    cd $PRODUCTION_PATH
    
    # Pull latest images
    docker-compose pull
    
    # Stop existing containers
    docker-compose down
    
    # Start new containers
    docker-compose up -d
    
    # Wait for services to be healthy
    echo "Waiting for services to start..."
    sleep 30
    
    # Run database migrations
    docker-compose exec backend npm run migrate
    
    # Check service health
    docker-compose ps
EOF

# Verify deployment
echo -e "${BLUE}✅ Verifying deployment...${NC}"
sleep 10

# Check if services are running
if curl -f https://api.techpulse.app/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is responding${NC}"
else
    echo -e "${RED}❌ Backend API is not responding${NC}"
    exit 1
fi

# Run health checks
echo -e "${BLUE}🏥 Running health checks...${NC}"

# Check database connection
if docker-compose exec backend npm run test:db > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection is healthy${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi

# Check Redis connection
if docker-compose exec backend npm run test:redis > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis connection is healthy${NC}"
else
    echo -e "${RED}❌ Redis connection failed${NC}"
fi

# Send deployment notification
echo -e "${BLUE}📧 Sending deployment notification...${NC}"
curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚀 TechPulse Production Deployment Successful!\nVersion: '$VERSION'\nAPI: https://api.techpulse.app/health"}' \
    $SLACK_WEBHOOK_URL

echo -e "${GREEN}🎉 TechPulse Production Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo "  ✅ Backend API: https://api.techpulse.app"
echo "  ✅ Database: MySQL 8.0"
echo "  ✅ Cache: Redis"
echo "  ✅ Monitoring: Prometheus + Grafana"
echo "  ✅ SSL: Enabled with Let's Encrypt"
echo ""
echo -e "${BLUE}🔗 Useful Links:${NC}"
echo "  📈 Monitoring: https://monitor.techpulse.app:3000"
echo "  📊 Metrics: https://monitor.techpulse.app:9090"
echo "  🔍 Logs: docker-compose logs -f"
echo ""
echo -e "${YELLOW}📱 Next Steps:${NC}"
echo "  1. Build and deploy mobile app"
echo "  2. Submit to App Store and Play Store"
echo "  3. Set up monitoring alerts"
echo "  4. Configure backup strategy"
