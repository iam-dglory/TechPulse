# Tech News Aggregator - Deployment Guide

This guide covers deploying the Tech News Aggregator application to cloud platforms like AWS and DigitalOcean.

## Prerequisites

- Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificate (for production)
- Cloud provider account (AWS/DigitalOcean)

## Quick Start with Docker

### 1. Local Development

```bash
# Clone the repository
git clone <repository-url>
cd tech-news-aggregator

# Copy environment file
cp env.example .env

# Edit environment variables
nano .env

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 2. Production Deployment

```bash
# Set production environment
export NODE_ENV=production

# Build and start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify deployment
curl http://localhost/health
```

## AWS Deployment

### Option 1: EC2 Instance

#### 1. Launch EC2 Instance

```bash
# Launch Ubuntu 22.04 LTS instance
# Instance type: t3.medium or larger
# Security groups: Allow HTTP (80), HTTPS (443), SSH (22)
```

#### 2. Configure EC2 Instance

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
```

#### 3. Deploy Application

```bash
# Clone repository
git clone <repository-url>
cd tech-news-aggregator

# Configure environment
cp env.example .env
nano .env

# Set production values
NODE_ENV=production
DB_PASSWORD=secure_database_password
JWT_SECRET=your_very_secure_jwt_secret
NEWS_API_KEY=your_news_api_key
GUARDIAN_API_KEY=your_guardian_api_key

# Start services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f backend
```

#### 4. Configure SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop nginx container temporarily
docker-compose stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to project
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
sudo chown ubuntu:ubuntu ./ssl/*.pem

# Update nginx configuration for your domain
nano nginx.conf

# Restart services
docker-compose up -d
```

### Option 2: AWS ECS with Fargate

#### 1. Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name tech-news-cluster

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

#### 2. Create ECS Service

```bash
# Create service
aws ecs create-service \
    --cluster tech-news-cluster \
    --service-name tech-news-service \
    --task-definition tech-news-task:1 \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### Option 3: AWS Elastic Beanstalk

#### 1. Create Dockerrun.aws.json

```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "your-registry/tech-news-backend:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "5000"
    }
  ]
}
```

#### 2. Deploy with EB CLI

```bash
# Install EB CLI
pip install awsebcli

# Initialize application
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

## DigitalOcean Deployment

### Option 1: Droplet with Docker

#### 1. Create Droplet

```bash
# Create Ubuntu 22.04 droplet
# Size: 2GB RAM or larger
# Add SSH key
# Enable monitoring
```

#### 2. Configure Droplet

```bash
# Connect to droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Create application directory
mkdir /opt/tech-news
cd /opt/tech-news
```

#### 3. Deploy Application

```bash
# Clone repository
git clone <repository-url> .

# Configure environment
cp env.example .env
nano .env

# Set production values
NODE_ENV=production
DB_PASSWORD=secure_database_password
JWT_SECRET=your_very_secure_jwt_secret

# Start services
docker compose up -d

# Set up firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### Option 2: DigitalOcean App Platform

#### 1. Create app.yaml

```yaml
name: tech-news-aggregator
services:
  - name: backend
    source_dir: backend
    github:
      repo: your-username/tech-news-aggregator
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 2
    instance_size_slug: basic-xxs
    routes:
      - path: /
    envs:
      - key: NODE_ENV
        value: production
      - key: DB_HOST
        value: ${db.DATABASE_HOST}
      - key: DB_PASSWORD
        value: ${db.DATABASE_PASSWORD}

databases:
  - name: mysql
    engine: MYSQL
    version: "8"
    size: db-s-1vcpu-1gb
```

#### 2. Deploy to App Platform

```bash
# Install doctl
snap install doctl

# Authenticate
doctl auth init

# Deploy application
doctl apps create --spec app.yaml
```

## Environment Variables

### Required Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secure_password
DB_NAME=tech_news

# JWT
JWT_SECRET=your_very_secure_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=24h

# News APIs
NEWS_API_KEY=your_news_api_key
GUARDIAN_API_KEY=your_guardian_api_key

# Server
NODE_ENV=production
PORT=5000
```

### Optional Variables

```bash
# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

## SSL Configuration

### Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot -y

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Custom SSL Certificate

```bash
# Copy certificates
cp your-cert.pem ./ssl/cert.pem
cp your-key.pem ./ssl/key.pem

# Set permissions
chmod 600 ./ssl/key.pem
chmod 644 ./ssl/cert.pem
```

## Monitoring and Logging

### Health Checks

```bash
# Check application health
curl http://your-domain.com/health

# Check database connection
docker-compose exec backend npm run health-check

# Check logs
docker-compose logs -f backend
```

### Monitoring Setup

```bash
# Install monitoring tools
docker-compose -f docker-compose.monitoring.yml up -d

# Access monitoring dashboards
# Prometheus: http://your-domain.com:9090
# Grafana: http://your-domain.com:3000
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker-compose exec mysql mysqldump -u root -p tech_news > backup.sql

# Restore backup
docker-compose exec -T mysql mysql -u root -p tech_news < backup.sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec mysql mysqldump -u root -p tech_news > backups/backup_$DATE.sql
find backups/ -name "backup_*.sql" -mtime +7 -delete
```

### Application Backup

```bash
# Backup application data
tar -czf app_backup_$(date +%Y%m%d).tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    backend/ mobile/ docker-compose.yml
```

## Scaling and Performance

### Horizontal Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Use load balancer
# Configure nginx upstream with multiple backend instances
```

### Database Optimization

```bash
# Optimize MySQL configuration
# Edit mysql.cnf in docker-compose.yml

# Add indexes for better performance
# See backend/init.sql for optimization queries
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**

   ```bash
   # Check database logs
   docker-compose logs mysql

   # Verify connection
   docker-compose exec backend npm run db-check
   ```

2. **SSL Certificate Issues**

   ```bash
   # Check certificate validity
   openssl x509 -in ssl/cert.pem -text -noout

   # Test SSL connection
   openssl s_client -connect your-domain.com:443
   ```

3. **High Memory Usage**

   ```bash
   # Monitor resource usage
   docker stats

   # Optimize MySQL memory settings
   # Adjust innodb_buffer_pool_size in mysql.cnf
   ```

### Log Analysis

```bash
# View application logs
docker-compose logs -f backend

# View nginx logs
docker-compose logs -f nginx

# View database logs
docker-compose logs -f mysql

# Search for errors
docker-compose logs backend | grep ERROR
```

## Security Considerations

### Production Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] Backup encryption
- [ ] Monitoring and alerting

### Security Headers

```nginx
# Add to nginx.conf
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

## Cost Optimization

### AWS Cost Optimization

- Use spot instances for development
- Implement auto-scaling
- Use S3 for static assets
- Monitor CloudWatch costs
- Use reserved instances for production

### DigitalOcean Cost Optimization

- Use appropriate droplet sizes
- Implement auto-scaling
- Use Spaces for file storage
- Monitor usage with Insights
- Use load balancers efficiently

## Support and Maintenance

### Regular Maintenance Tasks

```bash
# Weekly tasks
docker-compose pull
docker-compose up -d
docker system prune -f

# Monthly tasks
docker-compose exec mysql mysqlcheck -u root -p tech_news
# Review and rotate logs
# Update dependencies
# Security audit
```

### Update Process

```bash
# Update application
git pull origin main
docker-compose build
docker-compose up -d

# Verify deployment
curl http://your-domain.com/health
```

For additional support, please refer to the project documentation or create an issue in the repository.
