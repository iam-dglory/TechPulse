#!/bin/bash

# Tech News Aggregator Deployment Script
# Usage: ./deploy.sh [environment] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-production}
BACKUP_ENABLED=${BACKUP_ENABLED:-true}
HEALTH_CHECK_TIMEOUT=${HEALTH_CHECK_TIMEOUT:-60}

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Copying from env.example..."
        cp env.example .env
        log_warning "Please edit .env file with your configuration before running deployment again."
        exit 1
    fi
    
    log_success "Prerequisites check completed."
}

create_backup() {
    if [ "$BACKUP_ENABLED" = "true" ]; then
        log_info "Creating backup..."
        
        # Create backup directory
        mkdir -p backups
        
        # Backup database
        if docker-compose ps mysql | grep -q "Up"; then
            BACKUP_FILE="backups/db_backup_$(date +%Y%m%d_%H%M%S).sql"
            docker-compose exec -T mysql mysqldump -u root -p${DB_PASSWORD:-password} tech_news > "$BACKUP_FILE"
            log_success "Database backup created: $BACKUP_FILE"
        else
            log_warning "MySQL container is not running. Skipping database backup."
        fi
        
        # Backup application files
        APP_BACKUP="backups/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
        tar -czf "$APP_BACKUP" --exclude=node_modules --exclude=.git --exclude=backups .
        log_success "Application backup created: $APP_BACKUP"
        
        # Clean old backups (keep last 7 days)
        find backups/ -name "*.sql" -mtime +7 -delete
        find backups/ -name "*.tar.gz" -mtime +7 -delete
    else
        log_info "Backup disabled. Skipping backup creation."
    fi
}

pull_latest_changes() {
    log_info "Pulling latest changes..."
    
    if [ -d ".git" ]; then
        git pull origin main
        log_success "Latest changes pulled successfully."
    else
        log_warning "Not a git repository. Skipping git pull."
    fi
}

build_and_deploy() {
    log_info "Building and deploying application..."
    
    # Pull latest images
    log_info "Pulling latest Docker images..."
    docker-compose pull
    
    # Build custom images
    log_info "Building custom images..."
    docker-compose build --no-cache
    
    # Stop existing services
    log_info "Stopping existing services..."
    docker-compose down
    
    # Start services
    log_info "Starting services..."
    docker-compose up -d
    
    log_success "Application deployed successfully."
}

wait_for_health_check() {
    log_info "Waiting for health check..."
    
    local max_attempts=$((HEALTH_CHECK_TIMEOUT / 5))
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost/health > /dev/null 2>&1; then
            log_success "Health check passed!"
            return 0
        fi
        
        log_info "Health check attempt $attempt/$max_attempts failed. Retrying in 5 seconds..."
        sleep 5
        ((attempt++))
    done
    
    log_error "Health check failed after $HEALTH_CHECK_TIMEOUT seconds."
    return 1
}

show_deployment_info() {
    log_info "Deployment completed successfully!"
    echo ""
    echo "Application Information:"
    echo "======================="
    echo "Environment: $ENVIRONMENT"
    echo "Health Check: http://localhost/health"
    echo "API Base URL: http://localhost/api"
    echo ""
    echo "Useful Commands:"
    echo "==============="
    echo "View logs: docker-compose logs -f"
    echo "Stop services: docker-compose down"
    echo "Restart services: docker-compose restart"
    echo "Scale backend: docker-compose up -d --scale backend=3"
    echo ""
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused networks
    docker network prune -f
    
    log_success "Cleanup completed."
}

# Main deployment function
deploy() {
    log_info "Starting deployment for environment: $ENVIRONMENT"
    echo ""
    
    # Load environment variables
    if [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Create backup
    create_backup
    
    # Pull latest changes
    pull_latest_changes
    
    # Build and deploy
    build_and_deploy
    
    # Wait for health check
    if ! wait_for_health_check; then
        log_error "Deployment failed health check."
        log_info "Rolling back to previous version..."
        docker-compose down
        docker-compose up -d
        exit 1
    fi
    
    # Cleanup
    cleanup
    
    # Show deployment info
    show_deployment_info
    
    log_success "Deployment completed successfully!"
}

# Rollback function
rollback() {
    log_info "Rolling back to previous version..."
    
    # Stop current services
    docker-compose down
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t backups/db_backup_*.sql 2>/dev/null | head -n1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        log_info "Restoring database from: $LATEST_BACKUP"
        docker-compose up -d mysql
        
        # Wait for MySQL to be ready
        sleep 30
        
        # Restore database
        docker-compose exec -T mysql mysql -u root -p${DB_PASSWORD:-password} tech_news < "$LATEST_BACKUP"
        
        # Start all services
        docker-compose up -d
        
        log_success "Rollback completed successfully."
    else
        log_error "No backup found for rollback."
        exit 1
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [environment] [command]"
    echo ""
    echo "Environments:"
    echo "  production   Deploy to production (default)"
    echo "  staging      Deploy to staging"
    echo "  development  Deploy to development"
    echo ""
    echo "Commands:"
    echo "  deploy       Deploy application (default)"
    echo "  rollback     Rollback to previous version"
    echo "  status       Show deployment status"
    echo "  logs         Show application logs"
    echo ""
    echo "Environment Variables:"
    echo "  BACKUP_ENABLED=true|false     Enable/disable backup creation"
    echo "  HEALTH_CHECK_TIMEOUT=60       Health check timeout in seconds"
    echo ""
    echo "Examples:"
    echo "  $0 production deploy"
    echo "  $0 staging rollback"
    echo "  $0 development status"
}

# Show status
show_status() {
    log_info "Checking deployment status..."
    
    echo ""
    echo "Service Status:"
    echo "=============="
    docker-compose ps
    
    echo ""
    echo "Health Check:"
    echo "============="
    if curl -f -s http://localhost/health > /dev/null 2>&1; then
        log_success "Application is healthy"
    else
        log_error "Application health check failed"
    fi
    
    echo ""
    echo "Resource Usage:"
    echo "==============="
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# Show logs
show_logs() {
    log_info "Showing application logs..."
    docker-compose logs -f
}

# Parse command line arguments
COMMAND=${2:-deploy}

case $COMMAND in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac
