# Backend Environment Setup

This guide explains how to set up the backend environment variables for local development.

## 📋 Required Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@hostname:5432/texhpulze

# OpenAI API Key for AI-powered scoring and ELI5 generation
OPENAI_API_KEY=sk-xxxxxxxx

# JWT Secret for authentication (use a strong, random secret in production)
TEXHPULZE_JWT_SECRET=supersecuresecret

# Environment
NODE_ENV=development

# Server Port
PORT=8090

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Analytics Configuration (optional)
ANALYTICS_ENABLED=true
SENTRY_DSN=
SEGMENT_WRITE_KEY=
POSTHOG_API_KEY=

# Email Service Configuration (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@texhpulze.com

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:8090
```

## 🚀 Quick Setup

### 1. Create Backend Environment File

```bash
# Navigate to backend directory
cd backend

# Create .env file
cp ../env.example .env

# Edit .env with your actual values
# Use the variables shown above
```

### 2. Update Database URL

Replace the database URL with your actual PostgreSQL connection details:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/texhpulze_dev
```

### 3. Set OpenAI API Key

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys):

```env
OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
```

### 4. Generate JWT Secret

Generate a secure JWT secret:

```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 64
```

### 5. Configure Redis

Ensure Redis is running locally or update the URL:

```env
# Local Redis
REDIS_URL=redis://localhost:6379

# Redis with password
REDIS_URL=redis://:password@localhost:6379
```

## 🔧 Development Setup

### Using Docker Compose (Recommended)

1. **Start Services**:

   ```bash
   # From project root
   docker-compose up -d postgres redis
   ```

2. **Update DATABASE_URL**:

   ```env
   DATABASE_URL=postgresql://texhpulze:texhpulze_dev_password@localhost:5432/texhpulze_dev
   ```

3. **Update REDIS_URL**:
   ```env
   REDIS_URL=redis://:redis_dev_password@localhost:6379
   ```

### Manual Setup

1. **Install PostgreSQL**:

   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Create database: `createdb texhpulze_dev`

2. **Install Redis**:

   - Download from [redis.io](https://redis.io/download)
   - Start Redis server: `redis-server`

3. **Update Connection Strings**:
   ```env
   DATABASE_URL=postgresql://your_username@localhost:5432/texhpulze_dev
   REDIS_URL=redis://localhost:6379
   ```

## 🧪 Testing Configuration

### 1. Test Database Connection

```bash
cd backend
npm run typeorm:migrate
```

### 2. Test Redis Connection

```bash
# Start backend server
npm run dev

# Check logs for Redis connection
```

### 3. Test API Endpoints

```bash
# Health check
curl http://localhost:8090/health

# Test database health
curl http://localhost:8090/api/health/database
```

## 🚨 Common Issues

### Database Connection Failed

- **Check PostgreSQL is running**: `pg_isready`
- **Verify credentials**: Username, password, database name
- **Check port**: Default is 5432
- **Test connection**: `psql -h localhost -U username -d database_name`

### Redis Connection Failed

- **Check Redis is running**: `redis-cli ping`
- **Verify port**: Default is 6379
- **Check password**: If Redis has authentication enabled

### OpenAI API Errors

- **Verify API key**: Check it starts with `sk-`
- **Check credits**: Ensure you have OpenAI credits
- **Test API**: Use OpenAI playground to verify key works

### Port Already in Use

- **Change port**: Update `PORT=8091` in `.env`
- **Kill process**: `lsof -ti:8090 | xargs kill -9`
- **Check usage**: `netstat -an | grep 8090`

## 📝 Environment Variable Reference

| Variable               | Required | Description                    | Example                               |
| ---------------------- | -------- | ------------------------------ | ------------------------------------- |
| `DATABASE_URL`         | ✅       | PostgreSQL connection string   | `postgresql://user:pass@host:5432/db` |
| `OPENAI_API_KEY`       | ✅       | OpenAI API key for AI features | `sk-proj-...`                         |
| `TEXHPULZE_JWT_SECRET` | ✅       | JWT signing secret             | `supersecuresecret`                   |
| `NODE_ENV`             | ✅       | Environment mode               | `development`                         |
| `PORT`                 | ✅       | Server port                    | `8090`                                |
| `REDIS_URL`            | ✅       | Redis connection string        | `redis://localhost:6379`              |
| `ANALYTICS_ENABLED`    | ❌       | Enable analytics tracking      | `true`                                |
| `SENTRY_DSN`           | ❌       | Sentry error tracking          | `https://...`                         |
| `SEGMENT_WRITE_KEY`    | ❌       | Segment analytics              | `...`                                 |
| `POSTHOG_API_KEY`      | ❌       | PostHog analytics              | `...`                                 |
| `SMTP_HOST`            | ❌       | Email server host              | `smtp.gmail.com`                      |
| `SMTP_PORT`            | ❌       | Email server port              | `587`                                 |
| `SMTP_USER`            | ❌       | Email username                 | `user@gmail.com`                      |
| `SMTP_PASS`            | ❌       | Email password                 | `password`                            |
| `FROM_EMAIL`           | ❌       | From email address             | `noreply@texhpulze.com`               |
| `FRONTEND_URL`         | ❌       | Frontend application URL       | `http://localhost:3000`               |
| `API_BASE_URL`         | ❌       | API base URL                   | `http://localhost:8090`               |

## 🔒 Security Notes

- **Never commit `.env` files** to version control
- **Use strong JWT secrets** in production
- **Rotate API keys** regularly
- **Use environment-specific secrets** for each deployment
- **Enable SSL/TLS** for production databases

## 🆘 Getting Help

If you encounter issues:

1. **Check logs**: Look at server console output
2. **Verify environment**: Ensure all required variables are set
3. **Test connections**: Use provided test commands
4. **Check documentation**: Refer to this guide and API docs
5. **Create issue**: Report bugs in the repository

---

**Happy coding! 🚀**
