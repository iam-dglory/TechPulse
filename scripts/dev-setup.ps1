# TexhPulze Development Setup Script (PowerShell)
# This script sets up the complete development environment

param(
    [switch]$SkipDockerCheck,
    [switch]$SkipEnvFile,
    [switch]$SkipBuild
)

Write-Host "🚀 TexhPulze Development Setup" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Function to print colored output
function Print-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
}

function Print-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $Blue
}

# Check if Docker is installed
if (-not $SkipDockerCheck) {
    try {
        $dockerVersion = docker --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Docker not found"
        }
        Print-Status "Docker is installed: $dockerVersion"
    }
    catch {
        Print-Error "Docker is not installed. Please install Docker Desktop first."
        Print-Info "Download from: https://www.docker.com/products/docker-desktop"
        exit 1
    }

    # Check if Docker Compose is installed
    try {
        $composeVersion = docker-compose --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Docker Compose not found"
        }
        Print-Status "Docker Compose is installed: $composeVersion"
    }
    catch {
        Print-Error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    }
}

# Check if Make is available (optional)
try {
    $makeVersion = make --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Print-Status "Make is available - you can use 'make' commands"
    }
}
catch {
    Print-Warning "Make is not installed. You can still use docker-compose commands directly."
}

# Create .env file if it doesn't exist
if (-not $SkipEnvFile) {
    if (-not (Test-Path ".env")) {
        Print-Info "Creating .env file..."
        $envContent = @"
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
"@
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Print-Status ".env file created"
        Print-Warning "Please update .env file with your actual values (especially OPENAI_API_KEY)"
    }
    else {
        Print-Status ".env file already exists"
    }
}

# Build Docker images
if (-not $SkipBuild) {
    Print-Info "Building Docker images..."
    docker-compose build --no-cache
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Failed to build Docker images"
        exit 1
    }
}

# Start services
Print-Info "Starting services..."
docker-compose up -d postgres redis
if ($LASTEXITCODE -ne 0) {
    Print-Error "Failed to start database services"
    exit 1
}

# Wait for database to be ready
Print-Info "Waiting for database to be ready..."
Start-Sleep -Seconds 10

# Start API service
Print-Info "Starting API service..."
docker-compose up -d api
if ($LASTEXITCODE -ne 0) {
    Print-Error "Failed to start API service"
    exit 1
}

# Wait for API to be ready
Print-Info "Waiting for API to be ready..."
Start-Sleep -Seconds 15

# Run migrations
Print-Info "Running database migrations..."
docker-compose exec api npm run typeorm:migrate
if ($LASTEXITCODE -ne 0) {
    Print-Warning "Migrations failed or not configured"
}

# Seed database
Print-Info "Seeding database..."
docker-compose exec api npm run seed
if ($LASTEXITCODE -ne 0) {
    Print-Warning "Seeding failed or not configured"
}

# Start worker
Print-Info "Starting background worker..."
docker-compose up -d worker
if ($LASTEXITCODE -ne 0) {
    Print-Warning "Failed to start worker service"
}

Print-Status "Setup completed successfully!"
Write-Host ""
Write-Host "🎉 TexhPulze Development Environment is Ready!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 API: http://localhost:5000" -ForegroundColor White
Write-Host "🗄️  Database: localhost:5432" -ForegroundColor White
Write-Host "🔴 Redis: localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "📋 Useful Commands:" -ForegroundColor Yellow
Write-Host "  make logs         # View all logs" -ForegroundColor Gray
Write-Host "  make logs-api     # View API logs only" -ForegroundColor Gray
Write-Host "  make seed         # Re-seed database" -ForegroundColor Gray
Write-Host "  make shell-api    # Open API container shell" -ForegroundColor Gray
Write-Host "  make shell-db     # Open database shell" -ForegroundColor Gray
Write-Host "  make health       # Check service health" -ForegroundColor Gray
Write-Host "  make stop         # Stop all services" -ForegroundColor Gray
Write-Host "  make clean        # Clean up everything" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Development Tools (optional):" -ForegroundColor Yellow
Write-Host "  make dev-full     # Start with database and Redis admin tools" -ForegroundColor Gray
Write-Host "  http://localhost:8080  # Database admin (Adminer)" -ForegroundColor Gray
Write-Host "  http://localhost:8081  # Redis admin (Redis Commander)" -ForegroundColor Gray
Write-Host ""
Print-Info "Run 'make logs' to see what's happening!"
