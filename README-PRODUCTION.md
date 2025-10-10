# TechPulse Production Deployment Guide

## 🚀 Production-Ready Docker Compose Setup

This guide provides a complete production-ready Docker Compose configuration for TechPulse with SSL, monitoring, and persistent volumes.

## 📋 Services Included

- **Web (Node.js Backend)** - Main API server
- **Nginx** - Reverse proxy with SSL termination
- **MySQL** - Primary database with optimization
- **Redis** - Caching and session storage
- **Prometheus** - Metrics collection
- **Grafana** - Monitoring dashboards
- **Node Exporter** - System metrics
- **MySQL Exporter** - Database metrics
- **Redis Exporter** - Cache metrics
- **Certbot** - SSL certificate management
- **Backup Service** - Automated database backups

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Internet    │───▶│      Nginx      │───▶│   Node.js API   │
│                 │    │   (SSL/Proxy)   │    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Monitoring    │    │     MySQL       │
                       │ (Prometheus/    │    │   (Database)    │
                       │   Grafana)      │    └─────────────────┘
                       └─────────────────┘             │
                                                       ▼
                                              ┌─────────────────┐
                                              │     Redis       │
                                              │    (Cache)      │
                                              └─────────────────┘
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/iam-dglory/TechPulse.git
cd TechPulse

# Copy environment template
cp env.production.template .env.production

# Edit environment variables
nano .env.production
```

### 2. Configure Environment

Edit `.env.production` with your values:

```env
# Database Configuration
DB_PASSWORD=your-secure-db-password
DB_ROOT_PASSWORD=your-secure-root-password

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars

# Redis Configuration
REDIS_PASSWORD=your-secure-redis-password

# API Keys
NEWSAPI_KEY=your-newsapi-key
GUARDIAN_API_KEY=your-guardian-api-key
DEVTO_API_KEY=your-devto-api-key

# SSL Configuration
SSL_EMAIL=your-email@example.com
DOMAIN_NAME=techpulse.app

# Monitoring
GRAFANA_PASSWORD=your-grafana-admin-password
```

### 3. Create Required Directories

```bash
# Create persistent volume directories
sudo mkdir -p /opt/techpulse/{data/{mysql,redis,prometheus,grafana},logs,backups,uploads,static}

# Set proper permissions
sudo chown -R $USER:$USER /opt/techpulse
chmod -R 755 /opt/techpulse
```

### 4. Deploy

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### 5. Setup SSL Certificate

```bash
# Generate SSL certificate
docker-compose -f docker-compose.production.yml run --rm certbot

# Restart nginx to load SSL certificates
docker-compose -f docker-compose.production.yml restart nginx
```

### 6. Verify Deployment

```bash
# Check API health
curl https://api.techpulse.app/health

# Check monitoring
open https://monitor.techpulse.app:3000  # Grafana
open https://monitor.techpulse.app:9090  # Prometheus
```

## 📊 Monitoring & Logging

### Grafana Dashboards
- **URL**: `https://monitor.techpulse.app:3000`
- **Login**: `admin` / `[GRAFANA_PASSWORD]`
- **Features**:
  - System metrics (CPU, Memory, Disk)
  - Application metrics (API requests, response times)
  - Database metrics (connections, queries)
  - Redis metrics (memory usage, operations)

### Prometheus Metrics
- **URL**: `https://monitor.techpulse.app:9090`
- **Features**:
  - Custom application metrics
  - System metrics
  - Database metrics
  - Alert rules and notifications

### Log Management
```bash
# View application logs
docker-compose -f docker-compose.production.yml logs -f web

# View nginx logs
docker-compose -f docker-compose.production.yml logs -f nginx

# View database logs
docker-compose -f docker-compose.production.yml logs -f mysql
```

## 🔒 Security Features

### SSL/TLS Configuration
- **Modern TLS**: TLS 1.2 and 1.3 only
- **Strong Ciphers**: ECDHE and DHE cipher suites
- **HSTS**: HTTP Strict Transport Security
- **Certificate Management**: Automated Let's Encrypt renewal

### Security Headers
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: 1; mode=block
- **Content-Security-Policy**: Restrictive CSP
- **Referrer-Policy**: strict-origin-when-cross-origin

### Rate Limiting
- **API Endpoints**: 10 requests/second
- **Authentication**: 5 requests/second
- **General**: 30 requests/second
- **Connection Limits**: 20 connections per IP

### Database Security
- **Encrypted Connections**: SSL/TLS for MySQL
- **Access Control**: Role-based permissions
- **Backup Encryption**: Encrypted backups
- **Audit Logging**: Query and access logging

## 🚀 Performance Optimizations

### Database Optimizations
- **Buffer Pool**: 1GB InnoDB buffer pool
- **Query Cache**: 32MB query cache
- **Connection Pooling**: Optimized connection limits
- **Indexes**: Strategic database indexes

### Redis Optimizations
- **Memory Policy**: LRU eviction
- **Persistence**: AOF + RDB snapshots
- **Connection Pooling**: Optimized connections

### Nginx Optimizations
- **Gzip Compression**: Enabled for text assets
- **Keep-Alive**: Persistent connections
- **Caching**: Static file caching
- **Load Balancing**: Upstream health checks

### Application Optimizations
- **Resource Limits**: CPU and memory limits
- **Health Checks**: Container health monitoring
- **Graceful Shutdown**: Proper signal handling

## 📦 Backup Strategy

### Automated Backups
- **Database**: Daily automated backups
- **Redis**: Periodic RDB snapshots
- **Configuration**: Version-controlled configs
- **Retention**: 7 days local, configurable cloud

### Backup Commands
```bash
# Manual database backup
docker-compose -f docker-compose.production.yml exec mysql mysqldump -u root -p techpulse_production > backup.sql

# Restore from backup
docker-compose -f docker-compose.production.yml exec -T mysql mysql -u root -p techpulse_production < backup.sql
```

## 🔧 Maintenance

### Regular Tasks
```bash
# Update containers
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# Clean up old images
docker system prune -a

# Check disk usage
docker system df

# View resource usage
docker stats
```

### SSL Certificate Renewal
```bash
# Renew certificates (automated via cron)
docker-compose -f docker-compose.production.yml run --rm certbot renew

# Restart nginx after renewal
docker-compose -f docker-compose.production.yml restart nginx
```

## 🚨 Troubleshooting

### Common Issues

**Services Not Starting:**
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs [service-name]

# Check resource usage
docker stats

# Restart specific service
docker-compose -f docker-compose.production.yml restart [service-name]
```

**SSL Certificate Issues:**
```bash
# Check certificate status
docker-compose -f docker-compose.production.yml run --rm certbot certificates

# Force certificate renewal
docker-compose -f docker-compose.production.yml run --rm certbot renew --force-renewal
```

**Database Connection Issues:**
```bash
# Check database status
docker-compose -f docker-compose.production.yml exec mysql mysqladmin ping -h localhost -u root -p

# Check database logs
docker-compose -f docker-compose.production.yml logs mysql
```

**Performance Issues:**
```bash
# Check resource usage
docker stats

# Check database performance
docker-compose -f docker-compose.production.yml exec mysql mysql -u root -p -e "SHOW PROCESSLIST;"

# Check Redis performance
docker-compose -f docker-compose.production.yml exec redis redis-cli info stats
```

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale backend service
docker-compose -f docker-compose.production.yml up -d --scale web=3

# Update nginx upstream configuration for load balancing
```

### Vertical Scaling
```bash
# Increase resource limits in docker-compose.production.yml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
```

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Monitoring dashboards accessible
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Log rotation configured
- [ ] Alert notifications setup
- [ ] Performance monitoring active

## 📞 Support

For production deployment support:
- **Documentation**: Check this README and inline comments
- **Monitoring**: Use Grafana dashboards for diagnostics
- **Logs**: Check container logs for error details
- **Community**: GitHub Issues for bug reports

---

**🎉 Your TechPulse production environment is now ready for high-traffic, secure, and monitored operation!**
