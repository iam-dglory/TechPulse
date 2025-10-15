# TexhPulze 2.0 Worker System Guide

This guide explains the background job worker system for async story enhancement processing.

## 🚀 Quick Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Set up Redis:**

```bash
# Using Docker
docker-compose up redis -d

# Or install locally
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server
```

3. **Set up environment variables:**

```bash
# Add to your .env file
REDIS_URL="redis://localhost:6379"
OPENAI_API_KEY="your-openai-api-key-here"  # Optional
```

4. **Run migrations:**

```bash
npm run typeorm:migrate
```

5. **Start the worker:**

```bash
# Development mode
npm run worker:dev

# Production mode (after building)
npm run build
npm run worker

# Watch mode for development
npm run worker:watch
```

## 📊 Worker System Overview

The TexhPulze worker system provides:

### 1. **Background Job Processing**

- **Redis Queue**: Uses BullMQ with Redis for reliable job processing
- **Story Enhancement**: Async OpenAI-powered story analysis
- **Job Monitoring**: Track job status and progress
- **Graceful Shutdown**: Clean shutdown with signal handling

### 2. **Queue Management**

- **Job Prioritization**: Priority-based job processing
- **Retry Logic**: Automatic retry with exponential backoff
- **Job Cleanup**: Automatic cleanup of old completed/failed jobs
- **Concurrency Control**: Configurable worker concurrency

### 3. **Monitoring & Debugging**

- **Queue Statistics**: Real-time queue monitoring
- **Job Status Tracking**: Individual job status and results
- **Health Checks**: Worker and queue health monitoring
- **Comprehensive Logging**: Detailed logs for debugging

---

## 🔧 Architecture

### Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Server    │    │  Redis Queue    │    │  Worker Process │
│                 │    │                 │    │                 │
│  Story Creation │───▶│ Job Scheduling  │───▶│ Job Processing  │
│  Job Enqueue    │    │ BullMQ Queue    │    │ OpenAI Scoring  │
│                 │    │ Job Storage     │    │ DB Updates      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Job Flow

1. **Story Creation**: API creates story with local scores
2. **Job Enqueue**: Story enhancement job added to Redis queue
3. **Background Processing**: Worker picks up job and processes
4. **OpenAI Enhancement**: LLM analysis and score refinement
5. **Database Update**: Enhanced scores saved to database
6. **Job Completion**: Job marked as completed with results

---

## 🚀 Running the Worker

### Development Mode

```bash
# Start worker in development mode
npm run worker:dev

# Start worker with auto-reload
npm run worker:watch
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Start worker
npm run worker
```

### Docker Mode

```bash
# Start Redis and worker with Docker Compose
docker-compose -f docker-compose.override.yml up worker redis

# Or start all services
docker-compose -f docker-compose.override.yml up
```

---

## 📡 API Integration

### Story Creation with Queue

When a story is created, it's automatically queued for enhancement:

```bash
# Create story (automatically queued for enhancement)
curl -X POST "http://localhost:5000/api/stories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New AI Model Raises Privacy Concerns",
    "content": "A new AI model has been released...",
    "sectorTag": "AI Ethics",
    "impactTags": ["privacy", "concern"]
  }'

# Response includes job ID for tracking
{
  "success": true,
  "data": {
    "story": {
      "id": "story-uuid",
      "hypeScore": 6.5,
      "ethicsScore": 3.2,
      "jobId": "story-enhancement-story-uuid"  // For tracking enhancement
    }
  }
}
```

### Job Status Monitoring

```bash
# Check job status
curl -X GET "http://localhost:5000/api/stories/scoring/job/story-enhancement-story-uuid"

# Response
{
  "success": true,
  "data": {
    "job": {
      "id": "story-enhancement-story-uuid",
      "storyId": "story-uuid",
      "status": "completed",
      "result": {
        "success": true,
        "storyId": "story-uuid",
        "enhancedScores": {
          "hypeScore": 7.2,
          "ethicsScore": 4.8,
          "realityCheck": "Claims need verification from independent sources",
          "eli5Summary": "A new AI system was announced..."
        },
        "processingTime": 2500
      },
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:02:00.000Z"
    }
  }
}
```

### Queue Statistics

```bash
# Get queue statistics
curl -X GET "http://localhost:5000/api/stories/scoring/stats"

# Response
{
  "success": true,
  "data": {
    "stats": {
      "totalJobs": 25,
      "pendingJobs": 3,
      "completedJobs": 20,
      "failedJobs": 2,
      "openAIConfigured": true,
      "queueSize": 3
    }
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""  # Optional

# Worker Configuration
WORKER_CONCURRENCY=5
WORKER_MAX_ATTEMPTS=3
WORKER_BACKOFF_DELAY=2000

# OpenAI Configuration (Optional)
OPENAI_API_KEY="sk-your-openai-api-key"

# Debug Configuration
DEBUG_SCORING=true
LOG_LEVEL=debug
```

### Queue Configuration

```typescript
// Job options
{
  removeOnComplete: 100,    // Keep last 100 completed jobs
  removeOnFail: 50,         // Keep last 50 failed jobs
  attempts: 3,              // Retry failed jobs 3 times
  backoff: {
    type: 'exponential',    // Exponential backoff
    delay: 2000,           // Start with 2 second delay
  }
}

// Worker options
{
  concurrency: 5,           // Process up to 5 jobs concurrently
  removeOnComplete: 100,    // Cleanup completed jobs
  removeOnFail: 50,         // Cleanup failed jobs
}
```

---

## 🔄 Job Lifecycle

### Job States

```
waiting → active → completed
    ↓        ↓
  delayed  failed
```

### Job Processing

1. **Job Created**: Added to Redis queue with metadata
2. **Job Waiting**: Job waits in queue for available worker
3. **Job Active**: Worker picks up job and starts processing
4. **Job Processing**:
   - Fetch story from database
   - Run OpenAI enhancement
   - Update story with enhanced scores
   - Save results to database
5. **Job Completed**: Job marked as completed with results
6. **Job Failed**: Job marked as failed with error details

### Retry Logic

- **Max Attempts**: 3 attempts per job
- **Backoff Strategy**: Exponential backoff (2s, 4s, 8s)
- **Failure Handling**: Jobs marked as failed after max attempts

---

## 📊 Monitoring & Debugging

### Worker Logs

```bash
# Development mode with detailed logs
npm run worker:watch

# Production mode
npm run worker
```

**Sample Log Output:**

```
🚀 Starting TexhPulze Worker Service...
📅 Started at: 2025-01-15T10:00:00.000Z
🔧 Environment: development
✅ Redis connection successful
✅ Database connected successfully

📋 Configuration:
   Database: Connected
   Redis: redis://localhost:6379
   OpenAI: Configured
   Debug: Enabled
   Log Level: debug

✅ Worker service started successfully
⏳ Waiting for jobs...

📝 Story enhancement job queued: story-enhancement-123 for story story-uuid
🔄 Job story-enhancement-123 started processing
🔄 Processing story enhancement for story story-uuid
✅ Story story-uuid enhanced successfully
✅ Job story-enhancement-123 completed for story story-uuid
```

### Queue Monitoring

```bash
# Real-time queue statistics (every 30 seconds)
📊 Queue Stats - Waiting: 3, Active: 2, Completed: 20, Failed: 1
```

### Health Checks

```bash
# Check worker health
curl -X GET "http://localhost:8081"  # Redis Commander UI
```

---

## 🛠️ Development & Testing

### Local Development Setup

```bash
# 1. Start Redis
docker-compose up redis -d

# 2. Start worker in development mode
npm run worker:dev

# 3. Create test story (in another terminal)
curl -X POST "http://localhost:5000/api/stories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Story for Worker",
    "content": "This is a test story to verify worker processing.",
    "sectorTag": "Testing",
    "impactTags": ["test"]
  }'

# 4. Monitor job processing
# Watch the worker logs for job processing
```

### Testing Job Processing

```bash
# Test Redis connection
curl -X GET "http://localhost:5000/api/stories/scoring/openai/test"

# Check queue stats
curl -X GET "http://localhost:5000/api/stories/scoring/stats"

# Monitor specific job
curl -X GET "http://localhost:5000/api/stories/scoring/job/{job-id}"
```

### Docker Development

```bash
# Start all services with Docker Compose
docker-compose -f docker-compose.override.yml up

# Services started:
# - Redis (port 6379)
# - PostgreSQL (port 5432)
# - Backend API (port 5000)
# - Worker (background processing)
# - Redis Commander (port 8081)
```

---

## 🔍 Troubleshooting

### Common Issues

#### Redis Connection Failed

```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Check Redis logs
docker logs texhpulze-redis-dev

# Test connection
npm run worker:dev
```

#### Worker Not Processing Jobs

```bash
# Check worker logs
npm run worker:dev

# Check queue statistics
curl -X GET "http://localhost:5000/api/stories/scoring/stats"

# Check Redis queue directly
redis-cli
> KEYS *
> LLEN bull:story-enhancement:waiting
```

#### Jobs Stuck in Queue

```bash
# Check job status
curl -X GET "http://localhost:5000/api/stories/scoring/job/{job-id}"

# Check worker concurrency
# Increase concurrency in worker configuration

# Restart worker
npm run worker:dev
```

#### OpenAI API Errors

```bash
# Check API key
echo $OPENAI_API_KEY

# Test OpenAI connection
curl -X GET "http://localhost:5000/api/stories/scoring/openai/test"

# Check OpenAI credits
# Visit: https://platform.openai.com/usage
```

### Debug Mode

Enable detailed logging:

```bash
# Add to .env
DEBUG_SCORING=true
LOG_LEVEL=debug

# Restart worker
npm run worker:dev
```

---

## 🚀 Production Deployment

### Production Setup

```bash
# 1. Set production environment variables
export NODE_ENV=production
export REDIS_URL=redis://your-redis-server:6379
export DATABASE_URL=postgresql://user:pass@host:5432/db
export OPENAI_API_KEY=your-production-api-key

# 2. Build application
npm run build

# 3. Start worker
npm run worker

# 4. Monitor logs
tail -f logs/worker.log
```

### Scaling Workers

```bash
# Start multiple worker instances
npm run worker &
npm run worker &
npm run worker &

# Or use PM2 for process management
pm2 start dist/worker/index.js --name worker-1
pm2 start dist/worker/index.js --name worker-2
pm2 start dist/worker/index.js --name worker-3
```

### Monitoring Production

```bash
# Check worker health
curl -X GET "http://your-api-server:5000/api/stories/scoring/stats"

# Monitor Redis
redis-cli -h your-redis-server monitor

# Check worker processes
ps aux | grep worker
```

---

## 📋 Summary

The TexhPulze worker system provides:

✅ **Reliable Job Processing** - Redis-backed queue with BullMQ
✅ **Async Story Enhancement** - OpenAI-powered background processing
✅ **Job Monitoring** - Real-time status tracking and statistics
✅ **Graceful Shutdown** - Clean shutdown with signal handling
✅ **Retry Logic** - Automatic retry with exponential backoff
✅ **Production Ready** - Scalable and monitorable worker processes

**To run the worker:**

1. **Development**: `npm run worker:dev` or `npm run worker:watch`
2. **Production**: `npm run build && npm run worker`
3. **Docker**: `docker-compose -f docker-compose.override.yml up worker`

The worker system seamlessly integrates with the API to provide background processing for story enhancements, ensuring fast API responses while maintaining comprehensive analysis capabilities.


