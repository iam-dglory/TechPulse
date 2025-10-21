# TexhPulze Docker Setup Script for Windows

Write-Host "🐳 TexhPulze Docker Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check if Docker Desktop is installed
$dockerPath = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerPath) {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host "2. Install and restart your computer" -ForegroundColor White
    Write-Host "3. Launch Docker Desktop and wait for it to start" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    exit 1
}

Write-Host "✅ Docker is installed" -ForegroundColor Green

# Check if Docker Desktop is running
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker Desktop is running" -ForegroundColor Green
    }
    else {
        throw "Docker not running"
    }
}
catch {
    Write-Host "❌ Docker Desktop is not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Launch Docker Desktop from Start Menu" -ForegroundColor White
    Write-Host "2. Wait for Docker to start (you'll see a whale icon in system tray)" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    exit 1
}

# Check Docker Compose
try {
    $composeVersion = docker-compose --version 2>$null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker Compose is not available" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting TexhPulze deployment..." -ForegroundColor Cyan

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml down 2>$null

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Cyan
$result = docker-compose -f docker-compose.simple.yml up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Service URLs:" -ForegroundColor Cyan
    Write-Host "   Backend API: http://localhost:3000" -ForegroundColor White
    Write-Host "   Health Check: http://localhost:3000/health" -ForegroundColor White
    Write-Host "   API Posts: http://localhost:3000/api/posts" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Management Commands:" -ForegroundColor Cyan
    Write-Host "   View logs: docker-compose -f docker-compose.simple.yml logs -f" -ForegroundColor White
    Write-Host "   Stop services: docker-compose -f docker-compose.simple.yml down" -ForegroundColor White
    Write-Host "   Check status: docker-compose -f docker-compose.simple.yml ps" -ForegroundColor White
}
else {
    Write-Host "❌ Failed to start services" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if ports 3000 and 3306 are available" -ForegroundColor White
    Write-Host "2. Make sure Docker Desktop has enough resources allocated" -ForegroundColor White
    Write-Host "3. Try running as Administrator" -ForegroundColor White
    Write-Host "4. Check Docker Desktop logs" -ForegroundColor White
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test the API: curl http://localhost:3000/health" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "3. Create an account and start posting!" -ForegroundColor White
