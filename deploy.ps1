# TexhPulze Full Stack Deployment Script for Windows

Write-Host "🚀 Deploying TexhPulze Full Stack Application..." -ForegroundColor Cyan

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is available
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker Compose is not available." -ForegroundColor Red
    exit 1
}

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Remove old images (optional)
Write-Host "🗑️  Removing old images..." -ForegroundColor Yellow
docker-compose down --rmi all

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Cyan
docker-compose up --build -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "🔍 Checking service health..." -ForegroundColor Cyan

# Check backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is healthy" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Backend health check failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Backend health check failed" -ForegroundColor Red
}

# Check frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is healthy" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Frontend health check failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Frontend health check failed" -ForegroundColor Red
}

# Check database
try {
    docker-compose exec -T mysql mysqladmin ping -h localhost --silent
    Write-Host "✅ Database is healthy" -ForegroundColor Green
}
catch {
    Write-Host "❌ Database health check failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost" -ForegroundColor White
Write-Host "   Backend API: http://localhost:3000" -ForegroundColor White
Write-Host "   Health Check: http://localhost:3000/health" -ForegroundColor White
Write-Host "   Grafana: http://localhost:3001 (admin/texhpulze_grafana_2024)" -ForegroundColor White
Write-Host "   Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Management Commands:" -ForegroundColor Cyan
Write-Host "   View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   Stop services: docker-compose down" -ForegroundColor White
Write-Host "   Restart: docker-compose restart" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Visit http://localhost to see the application" -ForegroundColor White
Write-Host "   2. Create an account and start posting" -ForegroundColor White
Write-Host "   3. Test the grievance reporting system" -ForegroundColor White
Write-Host "   4. Share AI news and discuss" -ForegroundColor White
Write-Host ""
