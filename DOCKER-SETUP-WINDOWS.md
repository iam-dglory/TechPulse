# 🐳 Docker Setup for Windows - TechPulse Production

## 📋 **Prerequisites**

### 1. Install Docker Desktop for Windows

1. **Download**: https://www.docker.com/products/docker-desktop/
2. **Install**: Run the installer with default settings
3. **Start**: Launch Docker Desktop
4. **Verify**: Open PowerShell and run `docker --version`

### 2. Install Docker Compose

Docker Compose is included with Docker Desktop. Verify with:

```bash
docker compose version
```

## 🚀 **Production Deployment Commands**

### Start Production Services

```bash
# Using Docker Compose V2 (recommended)
docker compose -f docker-compose.production.yml up -d

# Or using Docker Compose V1 (if available)
docker-compose -f docker-compose.production.yml up -d
```

### Check Service Status

```bash
# List running containers
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f

# Check specific service logs
docker compose -f docker-compose.production.yml logs -f backend
```

### Stop Services

```bash
# Stop all services
docker compose -f docker-compose.production.yml down

# Stop and remove volumes
docker compose -f docker-compose.production.yml down -v
```

## 🔧 **Alternative: Manual Docker Commands**

If Docker Compose isn't available, you can run services manually:

### 1. Start MySQL Database

```bash
docker run -d \
  --name techpulse-mysql \
  -e MYSQL_ROOT_PASSWORD=35114f6be31121d77623478596fb903d \
  -e MYSQL_DATABASE=techpulse_production \
  -e MYSQL_USER=techpulse_prod \
  -e MYSQL_PASSWORD=b81bff80acef903d02203d8e1c6b7262 \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0
```

### 2. Start Redis Cache

```bash
docker run -d \
  --name techpulse-redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine redis-server --requirepass 3a67bfbee64caa346cd4572326ef9c55
```

### 3. Start Backend API

```bash
# First, build the backend image
docker build -f backend/Dockerfile.production -t techpulse-backend ./backend

# Then run the container
docker run -d \
  --name techpulse-backend \
  -p 5000:5000 \
  --env-file .env.production \
  --link techpulse-mysql:mysql \
  --link techpulse-redis:redis \
  techpulse-backend
```

### 4. Start Nginx (Optional)

```bash
docker run -d \
  --name techpulse-nginx \
  -p 80:80 \
  -p 443:443 \
  --link techpulse-backend:backend \
  -v ./nginx:/etc/nginx/conf.d \
  nginx:alpine
```

## 🔍 **Troubleshooting**

### Docker Not Found

```bash
# Install Docker Desktop from:
# https://www.docker.com/products/docker-desktop/

# Then restart PowerShell and try:
docker --version
```

### Permission Issues

```bash
# Run PowerShell as Administrator
# Or add your user to Docker group
```

### Port Already in Use

```bash
# Check what's using the port
netstat -ano | findstr :3306
netstat -ano | findstr :5000

# Kill the process or change ports in docker-compose.yml
```

### Memory Issues

```bash
# Increase Docker Desktop memory in settings:
# Docker Desktop → Settings → Resources → Memory
# Recommended: 4GB minimum
```

## 📊 **Verify Deployment**

### Check Container Status

```bash
docker ps
```

### Test API Health

```bash
# Test backend health
curl http://localhost:5000/health

# Test database connection
docker exec techpulse-mysql mysql -u root -p35114f6be31121d77623478596fb903d -e "SELECT 1"
```

### View Logs

```bash
# Backend logs
docker logs techpulse-backend

# MySQL logs
docker logs techpulse-mysql

# Redis logs
docker logs techpulse-redis
```

## 🔐 **SSL Certificate Setup (After Docker is Running)**

### 1. Get SSL Certificates

```bash
# Install Certbot
docker run -it --rm certbot/certbot --version

# Generate certificates (replace with your domain)
docker run -it --rm \
  -v ./ssl:/etc/letsencrypt \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/html \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d techpulse.app
```

### 2. Update Nginx Configuration

```bash
# Copy certificates to nginx
cp ssl/live/techpulse.app/fullchain.pem nginx/
cp ssl/live/techpulse.app/privkey.pem nginx/
```

## 🎯 **Quick Start Checklist**

- [ ] Install Docker Desktop for Windows
- [ ] Verify Docker is running: `docker --version`
- [ ] Get API keys from NewsAPI, Guardian, and Dev.to
- [ ] Create `.env.production` with your API keys
- [ ] Run: `docker compose -f docker-compose.production.yml up -d`
- [ ] Check status: `docker compose -f docker-compose.production.yml ps`
- [ ] Test API: `curl http://localhost:5000/health`
- [ ] Setup SSL certificates for your domain
- [ ] Update mobile app API URL

---

**🎉 Your TechPulse backend will be running once Docker is installed and configured!**
