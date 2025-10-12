# TechPulse Production Setup Script for Windows
# Run this script to set up your production environment

Write-Host "🚀 TechPulse Production Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if Docker is installed
Write-Host "`n🔍 Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop first:" -ForegroundColor Red
    Write-Host "   https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    exit 1
}

# Check if Docker Compose is available
Write-Host "`n🔍 Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version
    Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker Compose not found. Trying docker-compose..." -ForegroundColor Yellow
    try {
        $composeVersion = docker-compose --version
        Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker Compose not found. Please install Docker Desktop with Compose." -ForegroundColor Red
        exit 1
    }
}

# Create .env.production file if it doesn't exist
Write-Host "`n📝 Setting up environment file..." -ForegroundColor Yellow
if (!(Test-Path ".env.production")) {
    if (Test-Path "env.production.template") {
        Copy-Item "env.production.template" ".env.production"
        Write-Host "✅ Created .env.production from template" -ForegroundColor Green
    } else {
        Write-Host "❌ env.production.template not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ .env.production already exists" -ForegroundColor Green
}

# Display generated passwords
Write-Host "`n🔐 Generated secure passwords:" -ForegroundColor Yellow
Write-Host "DB_PASSWORD=b81bff80acef903d02203d8e1c6b7262" -ForegroundColor Cyan
Write-Host "DB_ROOT_PASSWORD=35114f6be31121d77623478596fb903d" -ForegroundColor Cyan
Write-Host "JWT_SECRET=5a0d6995e1dad2c74b33d9d020a73976269a14d4b95e56227872772076059e46" -ForegroundColor Cyan
Write-Host "REDIS_PASSWORD=3a67bfbee64caa346cd4572326ef9c55" -ForegroundColor Cyan
Write-Host "GRAFANA_PASSWORD=R3SqvOm1cvLznUGO" -ForegroundColor Cyan

# Display API key requirements
Write-Host "`n🔑 Required API Keys:" -ForegroundColor Yellow
Write-Host "1. NewsAPI.org: https://newsapi.org/" -ForegroundColor Cyan
Write-Host "2. The Guardian API: https://open-platform.theguardian.com/" -ForegroundColor Cyan
Write-Host "3. Dev.to API: https://dev.to/api" -ForegroundColor Cyan
Write-Host "4. Hacker News API: No key needed (free)" -ForegroundColor Green

# Check if API keys are configured
Write-Host "`n🔍 Checking API key configuration..." -ForegroundColor Yellow
$envContent = Get-Content ".env.production" -Raw
if ($envContent -match "your-newsapi-key-here") {
    Write-Host "⚠️  Please update API keys in .env.production file" -ForegroundColor Yellow
    Write-Host "   Edit the file and replace placeholder values with your actual API keys" -ForegroundColor Cyan
} else {
    Write-Host "✅ API keys appear to be configured" -ForegroundColor Green
}

# Create required directories
Write-Host "`n📁 Creating required directories..." -ForegroundColor Yellow
$directories = @("data/mysql", "data/redis", "data/prometheus", "data/grafana", "logs", "backups", "uploads", "static")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "✅ Directory exists: $dir" -ForegroundColor Green
    }
}

# Start Docker services
Write-Host "`n🐳 Starting Docker services..." -ForegroundColor Yellow
try {
    # Try Docker Compose V2 first
    docker compose -f docker-compose.production.yml up -d
    Write-Host "✅ Services started with Docker Compose V2" -ForegroundColor Green
} catch {
    try {
        # Fallback to Docker Compose V1
        docker-compose -f docker-compose.production.yml up -d
        Write-Host "✅ Services started with Docker Compose V1" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start services. Check your Docker setup." -ForegroundColor Red
        exit 1
    }
}

# Check service status
Write-Host "`n📊 Checking service status..." -ForegroundColor Yellow
try {
    docker compose -f docker-compose.production.yml ps
} catch {
    docker-compose -f docker-compose.production.yml ps
}

# Test API health
Write-Host "`n🏥 Testing API health..." -ForegroundColor Yellow
Start-Sleep -Seconds 10  # Wait for services to start
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
    Write-Host "✅ API is healthy!" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "   Port: $($response.port)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  API health check failed. Services may still be starting..." -ForegroundColor Yellow
    Write-Host "   Try again in a few minutes: curl http://localhost:5000/health" -ForegroundColor Cyan
}

# Display next steps
Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Get API keys from the links above" -ForegroundColor Cyan
Write-Host "2. Edit .env.production with your API keys" -ForegroundColor Cyan
Write-Host "3. Restart services: docker compose -f docker-compose.production.yml restart backend" -ForegroundColor Cyan
Write-Host "4. Setup SSL certificates for your domain" -ForegroundColor Cyan
Write-Host "5. Update your mobile app's API URL" -ForegroundColor Cyan

Write-Host "`n🎉 TechPulse production setup complete!" -ForegroundColor Green
Write-Host "📚 See PRODUCTION-API-KEYS-GUIDE.md for detailed instructions" -ForegroundColor Cyan
