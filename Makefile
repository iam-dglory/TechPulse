# TexhPulze Development Makefile
# Provides convenient shortcuts for local development

.PHONY: help dev dev-api dev-worker dev-full build clean logs shell-api shell-db shell-redis seed seed-fresh test test-api migrate migrate-fresh status stop restart

# Default target
help: ## Show this help message
	@echo "TexhPulze Development Commands"
	@echo "=============================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Examples:"
	@echo "  make dev          # Start all services"
	@echo "  make seed         # Seed the database"
	@echo "  make logs         # View logs"
	@echo "  make clean        # Clean up everything"

# Development commands
dev: ## Start all services in development mode
	docker-compose up --build -d
	@echo "🚀 TexhPulze development environment started!"
	@echo "📊 API: http://localhost:5000"
	@echo "🗄️  Database: localhost:5432"
	@echo "🔴 Redis: localhost:6379"
	@echo "💡 Run 'make logs' to view logs"

dev-api: ## Start only API and dependencies
	docker-compose up --build -d postgres redis api
	@echo "🚀 API service started!"

dev-worker: ## Start only worker and dependencies
	docker-compose up --build -d postgres redis worker
	@echo "⚙️  Worker service started!"

dev-full: ## Start all services including tools
	docker-compose --profile tools up --build -d
	@echo "🚀 Full development environment with tools started!"
	@echo "📊 API: http://localhost:5000"
	@echo "🗄️  Database Admin: http://localhost:8080"
	@echo "🔴 Redis Admin: http://localhost:8081"

build: ## Build all Docker images
	docker-compose build --no-cache
	@echo "🏗️  All images built successfully!"

# Database commands
seed: ## Seed the database with sample data
	docker-compose exec api npm run seed
	@echo "🌱 Database seeded successfully!"

seed-fresh: ## Drop and recreate database, then seed
	docker-compose down -v
	docker-compose up -d postgres
	sleep 10
	docker-compose up -d redis
	sleep 5
	docker-compose up -d api
	sleep 15
	docker-compose exec api npm run seed
	@echo "🔄 Database recreated and seeded!"

migrate: ## Run database migrations
	docker-compose exec api npm run typeorm:migrate
	@echo "📊 Migrations completed!"

migrate-fresh: ## Reset and run all migrations
	docker-compose exec api npm run typeorm:migrate:revert || true
	docker-compose exec api npm run typeorm:migrate
	@echo "🔄 Migrations reset and completed!"

# Testing commands
test: ## Run all tests
	docker-compose exec api npm run test:all
	@echo "🧪 All tests completed!"

test-api: ## Run API tests only
	docker-compose exec api npm run test:backend
	@echo "🧪 API tests completed!"

test-scoring: ## Run scoring tests
	docker-compose exec api npm run test:scoring
	@echo "🧪 Scoring tests completed!"

test-integration: ## Run integration tests
	docker-compose exec api npm run test:integration
	@echo "🧪 Integration tests completed!"

# Utility commands
logs: ## View logs from all services
	docker-compose logs -f

logs-api: ## View API logs only
	docker-compose logs -f api

logs-worker: ## View worker logs only
	docker-compose logs -f worker

logs-db: ## View database logs only
	docker-compose logs -f postgres

shell-api: ## Open shell in API container
	docker-compose exec api sh

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U texhpulze -d texhpulze_dev

shell-redis: ## Open Redis CLI
	docker-compose exec redis redis-cli -a redis_dev_password

status: ## Show status of all services
	docker-compose ps

stop: ## Stop all services
	docker-compose down
	@echo "🛑 All services stopped!"

restart: ## Restart all services
	docker-compose restart
	@echo "🔄 All services restarted!"

# Cleanup commands
clean: ## Stop and remove all containers, volumes, and networks
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "🧹 Cleanup completed!"

clean-volumes: ## Remove all volumes (WARNING: This will delete all data!)
	docker-compose down -v
	docker volume prune -f
	@echo "⚠️  All volumes removed! Data is lost!"

# Production commands
prod-build: ## Build production images
	docker-compose -f docker-compose.prod.yml build --no-cache

prod-deploy: ## Deploy to production
	docker-compose -f docker-compose.prod.yml up -d

# Health checks
health: ## Check health of all services
	@echo "🔍 Checking service health..."
	@echo "API Health:"
	@curl -s http://localhost:5000/health || echo "❌ API not responding"
	@echo ""
	@echo "Database Health:"
	@docker-compose exec postgres pg_isready -U texhpulze -d texhpulze_dev || echo "❌ Database not responding"
	@echo ""
	@echo "Redis Health:"
	@docker-compose exec redis redis-cli -a redis_dev_password ping || echo "❌ Redis not responding"

# Quick setup for new developers
setup: ## Complete setup for new developers
	@echo "🚀 Setting up TexhPulze development environment..."
	make build
	make dev
	sleep 30
	make migrate
	make seed
	@echo "✅ Setup complete! Run 'make logs' to see what's happening."
	@echo "📊 API: http://localhost:5000"
	@echo "🗄️  Database Admin: http://localhost:8080 (run 'make dev-full')"
	@echo "🔴 Redis Admin: http://localhost:8081 (run 'make dev-full')"

# Environment info
info: ## Show environment information
	@echo "TexhPulze Development Environment"
	@echo "================================="
	@echo "API URL: http://localhost:5000"
	@echo "Database: postgresql://texhpulze:texhpulze_dev_password@localhost:5432/texhpulze_dev"
	@echo "Redis: redis://:redis_dev_password@localhost:6379"
	@echo ""
	@echo "Database Admin: http://localhost:8080"
	@echo "Redis Admin: http://localhost:8081"
	@echo ""
	@echo "Useful commands:"
	@echo "  make seed         # Seed database"
	@echo "  make logs         # View logs"
	@echo "  make shell-api    # API container shell"
	@echo "  make shell-db     # Database shell"
	@echo "  make health       # Check service health"
