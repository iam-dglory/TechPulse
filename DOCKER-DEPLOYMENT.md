# 🚀 TexhPulze Docker Deployment Guide

This guide will help you deploy the complete TexhPulze application using Docker and Docker Compose.

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (included with Docker Desktop)
- **Git** (to clone the repository)

## 🛠️ Installation

### 1. Install Docker Desktop

**Windows:**

1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
2. Run the installer and follow the setup wizard
3. Restart your computer if prompted
4. Launch Docker Desktop and wait for it to start

**Mac:**

1. Download Docker Desktop for Mac from [docker.com](https://www.docker.com/products/docker-desktop)
2. Drag Docker.app to your Applications folder
3. Launch Docker Desktop

**Linux (Ubuntu/Debian):**

```bash
# Update package index
sudo apt-get update

# Install Docker
sudo apt-get install docker.io docker-compose

# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in, then test
docker --version
```

### 2. Clone the Repository

```bash
git clone <your-repo-url>
cd my-netfolio
```

## 🚀 Quick Start

### Option 1: Using PowerShell Script (Windows)

```powershell
# Run the deployment script
.\deploy.ps1
```

### Option 2: Using Bash Script (Linux/Mac)

```bash
# Make script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### Option 3: Manual Deployment

```bash
# Build and start all services
docker-compose up --build -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

## 📊 Service Architecture

The deployment includes the following services:

| Service        | Port      | Description                     |
| -------------- | --------- | ------------------------------- |
| **Frontend**   | 80        | React-based web interface       |
| **Backend**    | 3000      | Node.js API server              |
| **MySQL**      | 3306      | Database for persistent storage |
| **Redis**      | 6379      | Caching and session storage     |
| **Nginx**      | 443, 8080 | Reverse proxy and load balancer |
| **Prometheus** | 9090      | Metrics collection              |
| **Grafana**    | 3001      | Monitoring dashboard            |

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

```env
# Database
DB_HOST=mysql
DB_PORT=3306
DB_USER=texhpulze_user
DB_PASSWORD=texhpulze_password_2024
DB_NAME=texhpulze_db

# JWT
JWT_SECRET=texhpulze_jwt_secret_key_2024_production

# API Keys
NEWSAPI_KEY=cec6bb685eb9419fae97970066c63f5e
GUARDIAN_API_KEY=b133fd4e-fb25-42bf-a4ec-e9d25888285d

# Redis
REDIS_URL=redis://redis:6379
```

### Custom Configuration

To customize the deployment:

1. **Edit `docker-compose.yml`** to modify service configurations
2. **Update environment variables** in the compose file
3. **Modify `nginx.conf`** for custom routing rules
4. **Adjust resource limits** if needed

## 🌐 Accessing the Application

After deployment, access the application at:

- **Main Application**: http://localhost
- **API Health Check**: http://localhost:3000/health
- **Grafana Dashboard**: http://localhost:3001
  - Username: `admin`
  - Password: `texhpulze_grafana_2024`
- **Prometheus Metrics**: http://localhost:9090

## 🔍 Monitoring and Logs

### View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f frontend
```

### Health Checks

```bash
# Check all services
docker-compose ps

# Test API health
curl http://localhost:3000/health

# Test database connection
docker-compose exec mysql mysql -u texhpulze_user -p texhpulze_db -e "SELECT 1"
```

## 🛠️ Management Commands

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### Update Services

```bash
docker-compose pull
docker-compose up -d --build
```

### Clean Up

```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Remove everything (nuclear option)
docker system prune -a
```

## 🔒 Security Considerations

### Production Deployment

For production deployment, consider:

1. **Change default passwords** in `docker-compose.yml`
2. **Use environment files** for sensitive data
3. **Enable SSL/TLS** with proper certificates
4. **Set up firewall rules** to restrict access
5. **Use secrets management** for API keys
6. **Enable logging and monitoring**
7. **Set up automated backups**

### Environment File Example

Create a `.env` file:

```env
# Database
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_PASSWORD=your_secure_password
JWT_SECRET=your_secure_jwt_secret

# API Keys
NEWSAPI_KEY=your_newsapi_key
GUARDIAN_API_KEY=your_guardian_key

# Monitoring
GRAFANA_PASSWORD=your_grafana_password
```

Then reference it in `docker-compose.yml`:

```yaml
environment:
  MYSQL_PASSWORD: ${MYSQL_PASSWORD}
  JWT_SECRET: ${JWT_SECRET}
```

## 🐛 Troubleshooting

### Common Issues

**1. Port Already in Use**

```bash
# Check what's using the port
netstat -tulpn | grep :80

# Stop conflicting services
sudo systemctl stop apache2  # or nginx
```

**2. Database Connection Issues**

```bash
# Check database logs
docker-compose logs mysql

# Test database connection
docker-compose exec mysql mysql -u root -p
```

**3. Permission Issues**

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
```

**4. Out of Disk Space**

```bash
# Clean up Docker
docker system prune -a

# Check disk usage
df -h
```

### Getting Help

1. **Check logs**: `docker-compose logs -f`
2. **Verify services**: `docker-compose ps`
3. **Test connectivity**: Use curl or browser
4. **Check resources**: `docker stats`

## 📈 Scaling

### Horizontal Scaling

To scale specific services:

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Scale with load balancer (requires nginx config updates)
```

### Vertical Scaling

Modify resource limits in `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 1G
        reservations:
          cpus: "1"
          memory: 512M
```

## 🔄 Updates and Maintenance

### Regular Maintenance

1. **Update dependencies** regularly
2. **Monitor resource usage**
3. **Backup database** regularly
4. **Review logs** for errors
5. **Update Docker images**

### Backup Strategy

```bash
# Backup database
docker-compose exec mysql mysqldump -u root -p texhpulze_db > backup.sql

# Backup volumes
docker run --rm -v texhpulze_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup.tar.gz /data
```

## 🎯 Next Steps

1. **Test the application** thoroughly
2. **Set up monitoring** alerts
3. **Configure SSL certificates**
4. **Set up automated backups**
5. **Plan for scaling** based on usage
6. **Document your customizations**

---

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Test individual components
4. Review this documentation
5. Check Docker and Docker Compose versions

**Happy deploying! 🚀**
