# 🔑 TechPulse Production API Keys & Configuration Guide

## 📋 **Required API Keys**

### **1. NewsAPI.org** 
- **URL**: https://newsapi.org/
- **Cost**: Free tier (100 requests/day)
- **Steps**:
  1. Visit https://newsapi.org/
  2. Click "Get API Key"
  3. Sign up with email
  4. Copy API key from dashboard
- **Variable**: `NEWSAPI_KEY`

### **2. The Guardian API**
- **URL**: https://open-platform.theguardian.com/
- **Cost**: Free (rate limited)
- **Steps**:
  1. Visit https://open-platform.theguardian.com/
  2. Click "Register"
  3. Fill developer form
  4. Get API key via email
- **Variable**: `GUARDIAN_API_KEY`

### **3. Dev.to API**
- **URL**: https://dev.to/api
- **Cost**: Free
- **Steps**:
  1. Visit https://dev.to/
  2. Sign up for account
  3. Settings → Extensions → API Keys
  4. Generate new API key
- **Variable**: `DEVTO_API_KEY`

### **4. Hacker News API**
- **URL**: https://github.com/HackerNews/API
- **Cost**: Free (no API key needed)
- **Variable**: `HACKERNEWS_API_BASE_URL=https://hacker-news.firebaseio.com/v0`

## 🔐 **Generated Secure Passwords**

```env
# Database Configuration
DB_PASSWORD=b81bff80acef903d02203d8e1c6b7262
DB_ROOT_PASSWORD=35114f6be31121d77623478596fb903d

# JWT Configuration
JWT_SECRET=5a0d6995e1dad2c74b33d9d020a73976269a14d4b95e56227872772076059e46

# Redis Configuration
REDIS_PASSWORD=3a67bfbee64caa346cd4572326ef9c55

# Monitoring
GRAFANA_PASSWORD=R3SqvOm1cvLznUGO
GRAFANA_SECRET_KEY=fb0d4089397dcaeff85ea54a6a730acddcb9b65311e6c0c86f411c57326f89d0
```

## 📝 **Complete Production Environment File**

Create `.env.production` with the following content:

```env
# TechPulse Production Environment Variables

# Database Configuration
DB_HOST=mysql
DB_USER=techpulse_prod
DB_PASSWORD=b81bff80acef903d02203d8e1c6b7262
DB_NAME=techpulse_production
DB_ROOT_PASSWORD=35114f6be31121d77623478596fb903d

# JWT Configuration
JWT_SECRET=5a0d6995e1dad2c74b33d9d020a73976269a14d4b95e56227872772076059e46
JWT_EXPIRES_IN=24h

# Redis Configuration
REDIS_PASSWORD=3a67bfbee64caa346cd4572326ef9c55

# API Keys (REPLACE WITH YOUR ACTUAL API KEYS)
NEWSAPI_KEY=your-newsapi-key-here
GUARDIAN_API_KEY=your-guardian-api-key-here
DEVTO_API_KEY=your-devto-api-key-here
HACKERNEWS_API_BASE_URL=https://hacker-news.firebaseio.com/v0

# Server Configuration
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://techpulse.app,https://www.techpulse.app

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# SSL Configuration
SSL_EMAIL=your-email@example.com
DOMAIN_NAME=techpulse.app

# Monitoring
GRAFANA_PASSWORD=R3SqvOm1cvLznUGO
GRAFANA_SECRET_KEY=fb0d4089397dcaeff85ea54a6a730acddcb9b65311e6c0c86f411c57326f89d0

# Backup Configuration (Optional)
AWS_S3_BUCKET=your-backup-bucket-name
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Logging
LOG_LEVEL=info

# Performance
MAX_CONNECTIONS=200
QUERY_CACHE_SIZE=32M
INNODB_BUFFER_POOL_SIZE=1G
REDIS_MAX_MEMORY=256mb
```

## 🚀 **Quick Setup Commands**

### 1. Create Environment File
```bash
# Copy the template
cp env.production.template .env.production

# Edit with your values
nano .env.production
```

### 2. Start Production Services
```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### 3. Setup SSL Certificates
```bash
# Generate SSL certificates
docker-compose -f docker-compose.production.yml run --rm certbot

# Restart nginx
docker-compose -f docker-compose.production.yml restart nginx
```

### 4. Verify Deployment
```bash
# Check API health
curl https://api.techpulse.app/health

# Check monitoring
open https://monitor.techpulse.app:3000  # Grafana
open https://monitor.techpulse.app:9090  # Prometheus
```

## 📱 **Mobile App Connection**

Update your mobile app's API base URL to:
```
https://your-domain.com/api
```

## 🔍 **Troubleshooting**

### API Keys Not Working
1. Verify keys are correctly set in `.env.production`
2. Check API key quotas and limits
3. Test keys individually with curl

### SSL Certificate Issues
1. Ensure domain DNS points to your server
2. Check certificate status: `docker-compose logs certbot`
3. Force renewal: `docker-compose run --rm certbot renew --force-renewal`

### Services Not Starting
1. Check logs: `docker-compose logs [service-name]`
2. Verify environment variables are set
3. Check resource usage: `docker stats`

## 🎯 **Next Steps**

1. **Get API Keys**: Follow the links above to get your API keys
2. **Configure Environment**: Edit `.env.production` with your keys
3. **Start Services**: Run the Docker Compose commands
4. **Setup SSL**: Generate certificates for your domain
5. **Test Connection**: Verify all services are working
6. **Connect Mobile App**: Update your mobile app's API URL

---

**🎉 Your TechPulse production environment is ready for deployment!**
