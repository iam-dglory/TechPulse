# 🚀 TechPulse Production Setup Guide

## ✅ Environment File Created Successfully!

Your `.env.production` file has been created from the template. Now you need to configure it with your actual values.

## 🔧 Configuration Steps

### Step 1: Edit Environment File

Open `.env.production` in your text editor and replace the placeholder values:

```bash
# You can use any text editor:
notepad .env.production
# or
code .env.production
```

### Step 2: Configure Required Values

#### 🔐 **Database Configuration**

```env
DB_HOST=mysql
DB_USER=techpulse_prod
DB_PASSWORD=your-secure-db-password-here    # ← Change this
DB_NAME=techpulse_production
DB_ROOT_PASSWORD=your-secure-root-password-here  # ← Change this
```

#### 🔑 **JWT Configuration**

```env
JWT_SECRET=your-super-secure-jwt-secret-key-here-min-32-chars  # ← Generate a secure key
JWT_EXPIRES_IN=24h
```

#### 🔴 **Redis Configuration**

```env
REDIS_PASSWORD=your-secure-redis-password-here  # ← Change this
```

#### 📰 **API Keys** (Get these from the respective services)

```env
NEWSAPI_KEY=your-newsapi-key-here           # ← Get from https://newsapi.org/
GUARDIAN_API_KEY=your-guardian-api-key-here # ← Get from https://open-platform.theguardian.com/
DEVTO_API_KEY=your-devto-api-key-here       # ← Get from https://dev.to/api
HACKERNEWS_API_BASE_URL=https://hacker-news.firebaseio.com/v0
```

#### 🌐 **Domain Configuration**

```env
SSL_EMAIL=your-email@example.com    # ← Your email for SSL certificates
DOMAIN_NAME=techpulse.app          # ← Your domain name
```

#### 📊 **Monitoring**

```env
GRAFANA_PASSWORD=your-grafana-admin-password-here  # ← Choose a secure password
GRAFANA_SECRET_KEY=your-grafana-secret-key-here    # ← Generate a random key
```

### Step 3: Generate Secure Keys

#### Generate JWT Secret (32+ characters):

```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use OpenSSL (if available)
openssl rand -hex 32

# Option 3: Use online generator
# Visit: https://generate-secret.vercel.app/32
```

#### Generate Grafana Secret Key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Get API Keys

#### NewsAPI.org:

1. Visit: https://newsapi.org/
2. Sign up for free account
3. Get your API key from dashboard
4. Replace `your-newsapi-key-here` with your actual key

#### The Guardian API:

1. Visit: https://open-platform.theguardian.com/
2. Register for developer access
3. Get your API key
4. Replace `your-guardian-api-key-here` with your actual key

#### Dev.to API:

1. Visit: https://dev.to/api
2. Sign up for account
3. Get API key from settings
4. Replace `your-devto-api-key-here` with your actual key

## 🚀 Deployment Commands

### Start Production Services:

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### Setup SSL Certificates:

```bash
# Generate SSL certificates
docker-compose -f docker-compose.production.yml run --rm certbot

# Restart nginx to load certificates
docker-compose -f docker-compose.production.yml restart nginx
```

### Verify Deployment:

```bash
# Check API health
curl https://api.techpulse.app/health

# Check monitoring
open https://monitor.techpulse.app:3000  # Grafana
open https://monitor.techpulse.app:9090  # Prometheus
```

## 📁 Directory Structure Created

```
my-netfolio/
├── data/
│   ├── mysql/          # MySQL data persistence
│   ├── redis/          # Redis data persistence
│   ├── prometheus/     # Prometheus metrics data
│   └── grafana/        # Grafana dashboards
├── logs/               # Application logs
├── backups/            # Database backups
├── uploads/            # File uploads
├── static/             # Static assets
├── .env.production     # Your production config
└── docker-compose.production.yml
```

## 🔍 Troubleshooting

### If services fail to start:

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs [service-name]

# Check resource usage
docker stats

# Restart specific service
docker-compose -f docker-compose.production.yml restart [service-name]
```

### If SSL certificate fails:

```bash
# Check certificate status
docker-compose -f docker-compose.production.yml run --rm certbot certificates

# Force renewal
docker-compose -f docker-compose.production.yml run --rm certbot renew --force-renewal
```

## 🎯 Next Steps

1. **Configure Environment**: Edit `.env.production` with your values
2. **Start Services**: Run `docker-compose -f docker-compose.production.yml up -d`
3. **Setup SSL**: Generate SSL certificates with certbot
4. **Verify**: Check that all services are running
5. **Monitor**: Access Grafana dashboards for monitoring

## 📞 Support

If you encounter any issues:

- Check the logs: `docker-compose -f docker-compose.production.yml logs -f`
- Review the full documentation: `README-PRODUCTION.md`
- Ensure all environment variables are properly set
- Verify your domain DNS is pointing to your server

---

**🎉 You're ready to deploy TechPulse to production!**
