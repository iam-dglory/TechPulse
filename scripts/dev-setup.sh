#!/bin/bash

# TexhPulze Development Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 TexhPulze Development Setup"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Docker and Docker Compose are installed"

# Check if Make is installed (optional)
if command -v make &> /dev/null; then
    print_status "Make is available - you can use 'make' commands"
else
    print_warning "Make is not installed. You can still use docker-compose commands directly."
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_info "Creating .env file..."
    cat > .env << EOF
# TexhPulze Development Environment Variables
# Copy this file and update with your actual values

# Database
POSTGRES_DB=texhpulze_dev
POSTGRES_USER=texhpulze
POSTGRES_PASSWORD=texhpulze_dev_password

# Redis
REDIS_PASSWORD=redis_dev_password

# API
JWT_SECRET=dev-jwt-secret-key-change-in-production
OPENAI_API_KEY=your-openai-api-key-here
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000

# Production (for docker-compose.prod.yml)
# Uncomment and set these for production deployment
# POSTGRES_DB=texhpulze_prod
# POSTGRES_PASSWORD=your-secure-password
# REDIS_PASSWORD=your-secure-redis-password
# JWT_SECRET=your-super-secure-jwt-secret
# OPENAI_API_KEY=your-openai-api-key
# FRONTEND_URL=https://yourdomain.com
# API_BASE_URL=https://api.yourdomain.com
EOF
    print_status ".env file created"
    print_warning "Please update .env file with your actual values (especially OPENAI_API_KEY)"
else
    print_status ".env file already exists"
fi

# Build Docker images
print_info "Building Docker images..."
docker-compose build --no-cache

# Start services
print_info "Starting services..."
docker-compose up -d postgres redis

# Wait for database to be ready
print_info "Waiting for database to be ready..."
sleep 10

# Start API service
print_info "Starting API service..."
docker-compose up -d api

# Wait for API to be ready
print_info "Waiting for API to be ready..."
sleep 15

# Run migrations
print_info "Running database migrations..."
docker-compose exec api npm run typeorm:migrate || print_warning "Migrations failed or not configured"

# Seed database
print_info "Seeding database..."
docker-compose exec api npm run seed || print_warning "Seeding failed or not configured"

# Start worker
print_info "Starting background worker..."
docker-compose up -d worker

print_status "Setup completed successfully!"
echo ""
echo "🎉 TexhPulze Development Environment is Ready!"
echo "=============================================="
echo ""
echo "📊 API: http://localhost:5000"
echo "🗄️  Database: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📋 Useful Commands:"
echo "  make logs         # View all logs"
echo "  make logs-api     # View API logs only"
echo "  make seed         # Re-seed database"
echo "  make shell-api    # Open API container shell"
echo "  make shell-db     # Open database shell"
echo "  make health       # Check service health"
echo "  make stop         # Stop all services"
echo "  make clean        # Clean up everything"
echo ""
echo "🔧 Development Tools (optional):"
echo "  make dev-full     # Start with database and Redis admin tools"
echo "  http://localhost:8080  # Database admin (Adminer)"
echo "  http://localhost:8081  # Redis admin (Redis Commander)"
echo ""
print_info "Run 'make logs' to see what's happening!"
