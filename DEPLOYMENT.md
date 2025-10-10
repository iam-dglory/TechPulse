# TechPulse Production Deployment Guide

## 🚀 Complete Production Deployment

This guide will help you deploy TechPulse to production and submit it to app stores.

## 📋 Prerequisites

### Required Accounts & Services
- [ ] **GitHub Account** (for repository hosting)
- [ ] **Cloud Provider Account** (AWS, DigitalOcean, or similar)
- [ ] **Domain Name** (e.g., techpulse.app)
- [ ] **SSL Certificate** (Let's Encrypt or commercial)
- [ ] **Expo Account** (for mobile app builds)
- [ ] **Google Play Console** (for Android app)
- [ ] **Apple Developer Account** (for iOS app)

### Required API Keys
- [ ] **NewsAPI Key** (https://newsapi.org/)
- [ ] **The Guardian API Key** (https://open-platform.theguardian.com/)
- [ ] **Dev.to API Key** (https://dev.to/api)
- [ ] **Google Analytics ID** (optional)
- [ ] **Mixpanel Token** (optional)

## 🏗️ Infrastructure Setup

### Step 1: Cloud Server Setup

**Recommended: DigitalOcean Droplet**
```bash
# Create a new droplet
# Size: 4GB RAM, 2 vCPUs, 80GB SSD
# OS: Ubuntu 22.04 LTS
# Add SSH key
```

**Or AWS EC2 Instance:**
```bash
# Instance type: t3.medium
# AMI: Ubuntu Server 22.04 LTS
# Security groups: HTTP (80), HTTPS (443), SSH (22)
```

### Step 2: Domain and DNS Setup

1. **Purchase Domain**: Get a domain like `techpulse.app`
2. **DNS Configuration**:
   ```
   A     @        -> YOUR_SERVER_IP
   A     api      -> YOUR_SERVER_IP
   A     www      -> YOUR_SERVER_IP
   CNAME monitor  -> YOUR_SERVER_IP
   ```

### Step 3: SSL Certificate Setup

**Using Let's Encrypt:**
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d techpulse.app -d www.techpulse.app -d api.techpulse.app
```

## 🔧 Backend Deployment

### Step 1: Prepare Production Environment

```bash
# Clone repository
git clone https://github.com/iam-dglory/TechPulse.git
cd TechPulse

# Copy environment file
cp env.production.example .env.production

# Edit production environment
nano .env.production
```

**Configure `.env.production`:**
```env
# Database Configuration
DB_HOST=localhost
DB_USER=techpulse_prod
DB_PASSWORD=your-secure-password
DB_NAME=techpulse_production

# API Keys
NEWSAPI_KEY=your-newsapi-key
GUARDIAN_API_KEY=your-guardian-key
DEVTO_API_KEY=your-devto-key

# JWT Secret (generate secure key)
JWT_SECRET=your-super-secure-jwt-secret
```

### Step 2: Deploy with Docker

```bash
# Install Docker and Docker Compose
sudo apt update
sudo apt install docker.io docker-compose

# Start services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose ps
```

### Step 3: Database Setup

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed initial data
docker-compose exec backend npm run seed
```

### Step 4: Verify Deployment

```bash
# Check API health
curl https://api.techpulse.app/health

# Check logs
docker-compose logs -f backend
```

## 📱 Mobile App Deployment

### Step 1: Setup Expo EAS

```bash
cd TechNewsApp

# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Initialize EAS
eas build:configure
```

### Step 2: Configure App Store Credentials

**For Google Play Store:**
1. Create Google Play Console account
2. Create new application
3. Download service account JSON
4. Save as `google-play-service-account.json`

**For Apple App Store:**
1. Create Apple Developer account
2. Create App Store Connect app
3. Download provisioning profile
4. Save as `ios-provisioning-profile.mobileprovision`

### Step 3: Build Production Apps

```bash
# Build for both platforms
eas build --platform all --profile production

# Check build status
eas build:list
```

### Step 4: Submit to App Stores

```bash
# Submit to Google Play Store
eas submit --platform android --latest

# Submit to Apple App Store
eas submit --platform ios --latest
```

## 📊 Monitoring Setup

### Step 1: Access Monitoring Dashboards

- **Grafana**: https://monitor.techpulse.app:3000
- **Prometheus**: https://monitor.techpulse.app:9090

### Step 2: Configure Alerts

Edit `monitoring/alert_rules.yml`:
```yaml
groups:
- name: techpulse
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
```

### Step 3: Set Up Logging

```bash
# View application logs
docker-compose logs -f backend

# Set up log rotation
sudo nano /etc/logrotate.d/techpulse
```

## 🔒 Security Hardening

### Step 1: Firewall Configuration

```bash
# Configure UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3306  # Block direct MySQL access
```

### Step 2: Database Security

```bash
# Secure MySQL
docker-compose exec mysql mysql_secure_installation

# Create application user
docker-compose exec mysql mysql -u root -p
```

```sql
CREATE USER 'techpulse_prod'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON techpulse_production.* TO 'techpulse_prod'@'%';
FLUSH PRIVILEGES;
```

### Step 3: SSL/TLS Configuration

Update `nginx.production.conf` with strong SSL settings:
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
```

## 📈 Performance Optimization

### Step 1: Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_grievances_status ON grievances(status);
CREATE INDEX idx_discussions_created_at ON discussions(created_at);
```

### Step 2: Caching Setup

```bash
# Configure Redis caching
docker-compose exec redis redis-cli CONFIG SET maxmemory 256mb
docker-compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Step 3: CDN Setup

Configure CloudFlare or similar CDN:
1. Add domain to CloudFlare
2. Enable caching for static assets
3. Configure SSL/TLS settings

## 🚨 Backup Strategy

### Step 1: Database Backups

```bash
# Create backup script
nano backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec mysql mysqldump -u root -p techpulse_production > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://techpulse-backups/
```

### Step 2: Automated Backups

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup-db.sh
```

## 📱 App Store Optimization

### Step 1: App Store Metadata

**Google Play Store:**
- App title: TechPulse - Tech News & Governance
- Short description: World's first technology grievance & discussion platform
- Full description: Use content from `app-store-assets/app-description.md`
- Category: News & Magazines
- Tags: technology, news, governance, AI, community

**Apple App Store:**
- App name: TechPulse
- Subtitle: Tech News & Governance
- Keywords: technology,news,governance,AI,community,policy
- Category: News

### Step 2: App Store Screenshots

Create screenshots for:
- iPhone (6.7", 6.5", 5.5")
- iPad (12.9", 11")
- Android (phone, tablet)

### Step 3: App Store Review

**Before Submission:**
- [ ] Test app thoroughly on real devices
- [ ] Verify all features work correctly
- [ ] Check privacy policy and terms of service
- [ ] Ensure compliance with app store guidelines

**Review Timeline:**
- Google Play Store: 1-3 days
- Apple App Store: 1-7 days

## 🎯 Post-Deployment Checklist

### Backend Verification
- [ ] API endpoints responding correctly
- [ ] Database connections healthy
- [ ] SSL certificates valid
- [ ] Monitoring dashboards working
- [ ] Backup system operational

### Mobile App Verification
- [ ] Apps submitted to both stores
- [ ] Store listings complete
- [ ] Screenshots uploaded
- [ ] Privacy policy linked
- [ ] App store optimization complete

### Security Verification
- [ ] Firewall configured
- [ ] Database secured
- [ ] SSL/TLS properly configured
- [ ] Regular security updates enabled
- [ ] Monitoring alerts configured

## 🆘 Troubleshooting

### Common Issues

**API Not Responding:**
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs backend

# Restart services
docker-compose restart backend
```

**Database Connection Issues:**
```bash
# Check MySQL status
docker-compose exec mysql mysqladmin ping

# Verify credentials
docker-compose exec mysql mysql -u techpulse_prod -p
```

**Mobile Build Failures:**
```bash
# Clear Expo cache
eas build:clear-cache

# Check build logs
eas build:view [BUILD_ID]
```

## 📞 Support

For deployment issues:
- Check logs: `docker-compose logs -f`
- Monitor metrics: Grafana dashboard
- Review alerts: Prometheus alerts
- Contact support: techpulse@iam-dglory.dev

---

**🎉 Congratulations! Your TechPulse platform is now live and ready to empower technology democracy worldwide!**
