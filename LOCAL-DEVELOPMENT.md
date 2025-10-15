# TexhPulze Local Development Guide

This guide explains how to set up and run TexhPulze locally using Docker and Docker Compose.

## 🚀 Quick Start

### Option 1: Using Make (Recommended)

```bash
# Complete setup for new developers
make setup

# Or step by step:
make build
make dev
make migrate
make seed
```

### Option 2: Using Setup Script

```bash
# Run the automated setup script
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

### Option 3: Manual Docker Commands

```bash
# Build and start all services
docker-compose up --build -d

# Run migrations
docker-compose exec api npm run typeorm:migrate

# Seed database
docker-compose exec api npm run seed
```

## 📋 Prerequisites

- **Docker** (20.10+)
- **Docker Compose** (2.0+)
- **Make** (optional, for convenience commands)
- **Git**

### Install Docker

**Windows:**

- Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

**macOS:**

```bash
brew install --cask docker
```

**Linux (Ubuntu/Debian):**

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

## 🏗️ Architecture

The development environment includes:

- **API Service** (`api`): Node.js/Express backend
- **PostgreSQL** (`postgres`): Primary database
- **Redis** (`redis`): Cache and job queue
- **Worker** (`worker`): Background job processor
- **Adminer** (`adminer`): Database management UI (optional)
- **Redis Commander** (`redis-commander`): Redis management UI (optional)

## 🔧 Development Commands

### Core Commands

```bash
# Start all services
make dev

# Start with admin tools
make dev-full

# Stop all services
make stop

# Restart all services
make restart

# View logs
make logs

# Check service health
make health
```

### Database Commands

```bash
# Seed database with sample data
make seed

# Fresh database (drop, recreate, seed)
make seed-fresh

# Run migrations
make migrate

# Reset migrations
make migrate-fresh
```

### Testing Commands

```bash
# Run all tests
make test

# Run API tests only
make test-api

# Run scoring tests
make test-scoring

# Run integration tests
make test-integration
```

### Shell Access

```bash
# API container shell
make shell-api

# Database shell
make shell-db

# Redis CLI
make shell-redis
```

### Cleanup Commands

```bash
# Stop and remove containers
make clean

# Remove all data (WARNING: Data loss!)
make clean-volumes
```

## 🌐 Service URLs

| Service        | URL                          | Description                           |
| -------------- | ---------------------------- | ------------------------------------- |
| API            | http://localhost:5000        | Main backend API                      |
| Health Check   | http://localhost:5000/health | API health endpoint                   |
| Database Admin | http://localhost:8080        | Adminer (run `make dev-full`)         |
| Redis Admin    | http://localhost:8081        | Redis Commander (run `make dev-full`) |

## 🔐 Database Connection

**PostgreSQL:**

```
Host: localhost
Port: 5432
Database: texhpulze_dev
Username: texhpulze
Password: texhpulze_dev_password
```

**Redis:**

```
Host: localhost
Port: 6379
Password: redis_dev_password
```

## 📁 Project Structure

```
texhpulze/
├── backend/                 # Backend API code
│   ├── src/                # Source code
│   ├── scripts/            # Database scripts
│   ├── Dockerfile          # Backend Docker image
│   └── package.json        # Backend dependencies
├── frontend/               # Frontend code (if exists)
├── docker-compose.yml      # Development services
├── docker-compose.prod.yml # Production services
├── Makefile               # Development shortcuts
├── .env                   # Environment variables
└── scripts/               # Setup and utility scripts
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_DB=texhpulze_dev
POSTGRES_USER=texhpulze
POSTGRES_PASSWORD=texhpulze_dev_password

# Redis
REDIS_PASSWORD=redis_dev_password

# API
JWT_SECRET=dev-jwt-secret-key-change-in-production
OPENAI_API_KEY=your-openai-api-key-here
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000
```

## 🧪 Testing

### Run Tests

```bash
# All tests
make test

# Specific test suites
make test-api
make test-scoring
make test-integration
```

### Test Data

The seed script creates:

- Admin user: `admin@texhpulze.local` / `admin123`
- Company owners: `ceo@pixaai.com` / `owner123`
- Sample companies and stories
- Test data for all features

## 🐛 Debugging

### View Logs

```bash
# All services
make logs

# Specific service
make logs-api
make logs-worker
make logs-db
```

### Container Shell Access

```bash
# API container
make shell-api

# Database shell
make shell-db
psql -U texhpulze -d texhpulze_dev

# Redis CLI
make shell-redis
```

### Health Checks

```bash
# Check all services
make health

# Manual health check
curl http://localhost:5000/health
```

## 🔄 Development Workflow

### 1. Start Development

```bash
make setup
```

### 2. Make Changes

Edit code in your favorite editor. The API service uses volume mounting for hot reloading.

### 3. Test Changes

```bash
make test
```

### 4. View Logs

```bash
make logs-api
```

### 5. Reset Database (if needed)

```bash
make seed-fresh
```

### 6. Stop Development

```bash
make stop
```

## 🚀 Production Deployment

### Using Docker Compose

```bash
# Set production environment variables
export POSTGRES_PASSWORD="secure-password"
export REDIS_PASSWORD="secure-redis-password"
export JWT_SECRET="super-secure-jwt-secret"

# Deploy
make prod-build
make prod-deploy
```

### Environment Variables for Production

Update `.env` with production values:

```env
# Production Database
POSTGRES_DB=texhpulze_prod
POSTGRES_PASSWORD=your-secure-password
REDIS_PASSWORD=your-secure-redis-password

# Production API
JWT_SECRET=your-super-secure-jwt-secret
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Check what's using the port
   lsof -i :5000

   # Kill the process
   kill -9 <PID>
   ```

2. **Database Connection Failed**

   ```bash
   # Check database logs
   make logs-db

   # Restart database
   docker-compose restart postgres
   ```

3. **API Not Starting**

   ```bash
   # Check API logs
   make logs-api

   # Restart API
   docker-compose restart api
   ```

4. **Out of Disk Space**
   ```bash
   # Clean up Docker
   make clean
   docker system prune -a
   ```

### Reset Everything

```bash
# Nuclear option - reset everything
make clean
make setup
```

### Check Service Status

```bash
# View running containers
make status

# Check health
make health

# View resource usage
docker stats
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `make test`
5. Submit a pull request

For questions or issues, please check the troubleshooting section or create an issue in the repository.
