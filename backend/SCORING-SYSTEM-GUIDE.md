# TexhPulze 2.0 Scoring System Guide

This guide explains the comprehensive scoring system that automatically analyzes tech stories for hype and ethics.

## 🚀 Quick Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Set up OpenAI (Optional):**

```bash
# Add to your .env file
OPENAI_API_KEY="your-openai-api-key-here"
```

3. **Run migrations:**

```bash
npm run typeorm:migrate
```

4. **Start server:**

```bash
npm run dev:ts
```

## 📊 Scoring System Overview

The TexhPulze scoring system consists of three main components:

### 1. **Local Scoring (Always Available)**

- **Hype Scorer**: Analyzes marketing language, superlatives, and claims
- **Ethics Scorer**: Evaluates privacy, labor, environment, safety, and transparency

### 2. **OpenAI Enhancement (Optional)**

- **Enhanced Analysis**: Uses GPT-4 for refined scoring and explanations
- **Reality Check**: AI-generated verification recommendations
- **ELI5 Summary**: 60-second summary for general audience

### 3. **Background Processing**

- **Async Enhancement**: Stories are queued for OpenAI processing
- **Job Management**: Track scoring job status and results

---

## 🤖 Local Scoring Algorithms

### Hype Score (1-10)

**Deterministic Heuristics:**

- **Marketing Language Density** (25%): Counts marketing buzzwords
- **Superlatives** (20%): Tracks "best", "first", "revolutionary" usage
- **Claims** (25%): Detects breakthrough/unprecedented claims
- **Punctuation** (15%): Exclamation marks, questions, ellipsis
- **Marketing/Technical Ratio** (15%): Balance of marketing vs technical terms

**Example Scoring:**

```javascript
// High hype story
"Revolutionary AI breakthrough that will change everything!!!";
// Marketing: 8/10, Superlatives: 9/10, Claims: 10/10
// Final Hype Score: 9/10

// Low hype story
"Technical analysis of algorithm optimization in machine learning models";
// Marketing: 1/10, Superlatives: 1/10, Claims: 1/10
// Final Hype Score: 1/10
```

### Ethics Score (1-10)

**Rule-Based Analysis:**

- **Privacy** (25%): Data protection, consent, minimization
- **Labor** (20%): Automation impact, worker support
- **Environment** (15%): Sustainability, energy efficiency
- **Safety** (25%): Bias, discrimination, fairness
- **Transparency** (15%): Open source, audits, accountability

**Positive Indicators:**

- Privacy policy mentions
- Data minimization claims
- Worker retraining programs
- Environmental sustainability
- Bias mitigation measures
- Independent audits

**Negative Indicators:**

- Data selling claims
- Surveillance without consent
- Automation without mitigation
- High energy consumption
- Bias without addressing
- Lack of transparency

---

## 🔧 API Endpoints

### Story Scoring (Automatic)

When creating stories, scoring happens automatically:

```bash
# Create story (automatically scored)
curl -X POST "http://localhost:5000/api/stories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New AI Model Raises Privacy Concerns",
    "content": "A new AI model has been released that processes user data...",
    "sectorTag": "AI Ethics",
    "impactTags": ["privacy", "concern"]
  }'

# Response includes scores
{
  "success": true,
  "data": {
    "story": {
      "hypeScore": 6.5,
      "ethicsScore": 3.2,
      "realityCheck": "High impact story - verify claims with multiple sources.",
      "impactTags": ["privacy-concern", "ethics-concern"]
    }
  }
}
```

### Scoring Management

#### Get Scoring Statistics

```bash
curl -X GET "http://localhost:5000/api/stories/scoring/stats"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalJobs": 25,
      "pendingJobs": 3,
      "completedJobs": 20,
      "failedJobs": 2,
      "openAIConfigured": true,
      "queueSize": 25
    }
  }
}
```

#### Get Scoring Job Status

```bash
curl -X GET "http://localhost:5000/api/stories/scoring/job/job-id-here"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "scoring_123_1642234567890",
      "storyId": "story-uuid",
      "status": "completed",
      "result": {
        "hypeScore": 7.2,
        "ethicsScore": 4.8,
        "enhanced": true,
        "realityCheck": "Claims need verification from independent sources",
        "eli5Summary": "A new AI system was announced that could impact privacy..."
      },
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:02:00.000Z"
    }
  }
}
```

#### Test OpenAI Connection

```bash
curl -X GET "http://localhost:5000/api/stories/scoring/openai/test"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "connected": true,
    "configured": true,
    "hasApiKey": true
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# Required for OpenAI enhancement
OPENAI_API_KEY="sk-your-openai-api-key"

# Optional: Customize scoring weights
HYPE_SCORE_MARKETING_WEIGHT=0.25
HYPE_SCORE_SUPERLATIVES_WEIGHT=0.20
ETHICS_SCORE_PRIVACY_WEIGHT=0.25
ETHICS_SCORE_SAFETY_WEIGHT=0.25

# Optional: Queue management
SCORING_QUEUE_MAX_SIZE=100
SCORING_JOB_CLEANUP_HOURS=1
```

### Scoring Weights (Configurable)

**Hype Score Weights:**

- Marketing Language: 25%
- Superlatives: 20%
- Claims: 25%
- Punctuation: 15%
- Marketing/Technical Ratio: 15%

**Ethics Score Weights:**

- Privacy: 25%
- Labor: 20%
- Environment: 15%
- Safety: 25%
- Transparency: 15%

---

## 🔄 Background Processing

### How It Works

1. **Story Creation**: Local scores calculated immediately
2. **Queue Enhancement**: Story queued for OpenAI processing
3. **Background Processing**: OpenAI analyzes and enhances scores
4. **Results Storage**: Enhanced scores stored in database
5. **Cleanup**: Old jobs cleaned up automatically

### Job Lifecycle

```
pending → processing → completed/failed
```

### Queue Management

- **Max Concurrent Jobs**: 5
- **Job Cleanup**: After 1 hour
- **Retry Logic**: Failed jobs marked as failed (no retry)
- **Rate Limiting**: Respects OpenAI API limits

---

## 📈 Scoring Examples

### High Hype, Low Ethics

```json
{
  "title": "Revolutionary AI Will Transform Everything!!!",
  "content": "This groundbreaking technology will revolutionize the industry...",
  "hypeScore": 9.2,
  "ethicsScore": 2.1,
  "realityCheck": "Extreme hype claims with minimal ethical considerations",
  "impactTags": ["high-hype", "unethical", "potential-clickbait"]
}
```

### Low Hype, High Ethics

```json
{
  "title": "Privacy-First AI Model with Transparent Data Practices",
  "content": "New AI model implements data minimization, user consent...",
  "hypeScore": 2.8,
  "ethicsScore": 8.7,
  "realityCheck": "Strong ethical framework with measured claims",
  "impactTags": ["privacy-positive", "transparency-positive", "ethical"]
}
```

### Balanced Story

```json
{
  "title": "AI Research Shows Promise with Privacy Considerations",
  "content": "Researchers present new findings on AI capabilities...",
  "hypeScore": 5.4,
  "ethicsScore": 6.2,
  "realityCheck": "Balanced reporting with moderate claims",
  "impactTags": ["neutral", "research-based"]
}
```

---

## 🛠️ Development & Testing

### Test Local Scoring

```bash
# Create a test story
curl -X POST "http://localhost:5000/api/stories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Story for Scoring",
    "content": "This is a test story to verify scoring algorithms work correctly.",
    "sectorTag": "Testing",
    "impactTags": ["test"]
  }'
```

### Test OpenAI Enhancement

```bash
# Check if OpenAI is configured
curl -X GET "http://localhost:5000/api/stories/scoring/openai/test"

# Create story and check job status
# (Job ID returned in creation response)
curl -X GET "http://localhost:5000/api/stories/scoring/job/{job-id}"
```

### Monitor Scoring Queue

```bash
# Check queue status
curl -X GET "http://localhost:5000/api/stories/scoring/stats"
```

---

## 🔍 Troubleshooting

### Common Issues

#### OpenAI Not Working

```bash
# Check configuration
curl -X GET "http://localhost:5000/api/stories/scoring/openai/test"

# Verify API key in .env
echo $OPENAI_API_KEY

# Check OpenAI account credits
```

#### Scoring Jobs Stuck

```bash
# Check job status
curl -X GET "http://localhost:5000/api/stories/scoring/stats"

# Clear queue (if needed)
# This would require adding a clear endpoint
```

#### Low Confidence Scores

- **Cause**: Short content, missing company data
- **Solution**: Ensure stories have sufficient content and company information

### Debug Mode

Enable debug logging:

```bash
# Add to .env
DEBUG_SCORING=true
LOG_LEVEL=debug
```

---

## 📚 Integration Examples

### Frontend Integration

```javascript
// Get story with enhanced scores
const response = await fetch("/api/stories/story-id");
const story = await response.json();

// Display scores with explanations
if (story.data.story.hypeScore >= 8) {
  showWarning("High hype detected - verify claims independently");
}

if (story.data.story.ethicsScore <= 3) {
  showWarning("Ethics concerns identified");
}

// Show reality check
if (story.data.story.realityCheck) {
  showRealityCheck(story.data.story.realityCheck);
}
```

### Mobile App Integration

```javascript
// Check scoring job status
const checkScoringJob = async (jobId) => {
  const response = await fetch(`/api/stories/scoring/job/${jobId}`);
  const job = await response.json();

  if (job.data.job.status === "completed") {
    // Update UI with enhanced scores
    updateStoryScores(job.data.job.result);
  }
};
```

---

## 🚀 Production Deployment

### OpenAI API Key Setup

1. **Get API Key**: Sign up at https://platform.openai.com
2. **Set Environment Variable**: Add to your production environment
3. **Monitor Usage**: Track API usage and costs
4. **Rate Limiting**: Implement appropriate rate limiting

### Performance Optimization

- **Batch Processing**: Process multiple stories together
- **Caching**: Cache scoring results for similar content
- **Queue Management**: Monitor queue size and processing time
- **Error Handling**: Graceful fallback to local scores

### Monitoring

```bash
# Check system health
curl -X GET "http://localhost:5000/api/stories/scoring/stats"

# Monitor OpenAI usage
curl -X GET "http://localhost:5000/api/stories/scoring/openai/test"
```

---

## 📋 Summary

The TexhPulze scoring system provides:

✅ **Automatic Local Scoring** - Always available, fast, deterministic
✅ **OpenAI Enhancement** - Optional LLM-powered analysis
✅ **Background Processing** - Async enhancement without blocking
✅ **Comprehensive Analysis** - Hype, ethics, reality checks, summaries
✅ **Job Management** - Track and monitor scoring progress
✅ **Flexible Configuration** - Customizable weights and thresholds

**To enable OpenAI enhancements:**

1. Set `OPENAI_API_KEY` in your environment
2. Restart the server
3. Stories will automatically be queued for enhancement

The system gracefully falls back to local scoring if OpenAI is unavailable, ensuring reliable operation in all environments.


