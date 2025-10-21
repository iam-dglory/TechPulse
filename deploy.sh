#!/bin/bash

echo "🚀 Deploying TexhPulze Full Stack Application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional)
echo "🗑️  Removing old images..."
docker-compose down --rmi all

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check backend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Check frontend
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

# Check database
if docker-compose exec mysql mysqladmin ping -h localhost --silent; then
    echo "✅ Database is healthy"
else
    echo "❌ Database health check failed"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📊 Service URLs:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"
echo "   Grafana: http://localhost:3001 (admin/texhpulze_grafana_2024)"
echo "   Prometheus: http://localhost:9090"
echo ""
echo "🔧 Management Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart: docker-compose restart"
echo ""
echo "📝 Next Steps:"
echo "   1. Visit http://localhost to see the application"
echo "   2. Create an account and start posting"
echo "   3. Test the grievance reporting system"
echo "   4. Share AI news and discuss"
echo ""