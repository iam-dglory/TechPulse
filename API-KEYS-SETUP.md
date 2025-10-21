# 🔑 TechPulse API Keys Setup

## Overview

The API keys for NewsAPI.org and The Guardian API have been added to the appropriate configuration files in the TechPulse backend.

## API Keys Added

### NewsAPI.org

- **Key**: `cec6bb685eb9419fae97970066c63f5e`
- **Usage**: Fetches tech news articles from NewsAPI.org
- **Environment Variable**: `NEWS_API_KEY`

### The Guardian API

- **Key**: `b133fd4e-fb25-42bf-a4ec-e9d25888285d`
- **Usage**: Fetches technology articles from The Guardian
- **Environment Variable**: `GUARDIAN_API_KEY`

## Files Updated

### 1. Environment Configuration Files

#### `backend/env.example`

- Added actual API keys to the example environment file
- Used as a template for creating `.env` files

#### `env.production.template`

- Updated with production API keys
- Used for production deployment setup

#### `backend/env.replit.example`

- Added API keys for Replit deployment
- Used when setting up the backend on Replit

### 2. Documentation Files

#### `backend/README-REPLIT.md`

- Updated with actual API keys in the setup instructions
- Provides clear guidance for Replit deployment

### 3. Setup Scripts

#### `backend/setup-api-keys.js`

- Interactive script to help users set up their environment
- Automatically creates `.env` file with the provided API keys
- Includes validation and error handling

## How to Use

### Option 1: Automatic Setup (Recommended)

```bash
cd backend
node setup-api-keys.js
```

### Option 2: Manual Setup

1. Copy `backend/env.example` to `backend/.env`
2. The API keys are already included in the example file

### Option 3: Production Setup

1. Copy `env.production.template` to `.env.production`
2. Update other production-specific values as needed

## Environment Variables Structure

```bash
# News API Keys
NEWS_API_KEY=cec6bb685eb9419fae97970066c63f5e
GUARDIAN_API_KEY=b133fd4e-fb25-42bf-a4ec-e9d25888285d

# Optional API Keys (for future use)
DEVTO_API_KEY=your_devto_api_key_here
HACKERNEWS_API_BASE_URL=https://hacker-news.firebaseio.com/v0
```

## API Usage in Code

The API keys are used in the following files:

### `backend/src/services/newsAggregator.js`

- `NEWS_API_KEY` - Used for NewsAPI.org requests
- `GUARDIAN_API_KEY` - Used for The Guardian API requests

### Example Usage:

```javascript
// NewsAPI.org
const response = await axios.get(
  `https://newsapi.org/v2/everything?q=technology&apiKey=${process.env.NEWS_API_KEY}`
);

// The Guardian API
const response = await axios.get(
  `https://content.guardianapis.com/search?section=technology&api-key=${process.env.GUARDIAN_API_KEY}`
);
```

## Testing the Setup

### 1. Start the Backend Server

```bash
cd backend
npm start
```

### 2. Test API Endpoints

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test fallback system
curl http://localhost:5000/api/test/fallback-data

# Test news aggregation (if database is connected)
curl http://localhost:5000/api/articles
```

### 3. Test Fallback Mode

```bash
# Simulate database error and test fallback
curl http://localhost:5000/api/test/test-fallback
```

## Security Notes

### Development Environment

- API keys are included in example files for easy setup
- These are development/testing keys with limited quotas

### Production Environment

- Use environment variables for production deployments
- Consider using secret management services
- Monitor API usage and implement rate limiting

### Best Practices

- Never commit actual `.env` files to version control
- Use different API keys for development and production
- Regularly rotate API keys for security
- Monitor API usage and costs

## Troubleshooting

### API Key Not Working

1. Verify the API key is correctly set in environment variables
2. Check if the API key has the necessary permissions
3. Ensure the API key hasn't exceeded its quota limits

### Environment Variables Not Loading

1. Make sure the `.env` file is in the correct location (`backend/.env`)
2. Restart the server after updating environment variables
3. Check that `dotenv` is properly configured in `server.js`

### Fallback Mode Activation

1. Check server logs for fallback activation messages
2. Verify database connection if fallback is not expected
3. Test fallback functionality with `/api/test/test-fallback`

## Next Steps

1. **Set up the environment**: Run `node backend/setup-api-keys.js`
2. **Start the backend**: `cd backend && npm start`
3. **Test the APIs**: Verify news aggregation is working
4. **Test fallback mode**: Ensure fallback system works when database is unavailable
5. **Deploy to production**: Use the production template for deployment

## Support

For issues with API keys or setup:

- Check the logs in the backend server output
- Verify environment variables are loaded correctly
- Test individual API endpoints
- Review the fallback system documentation in `backend/FALLBACK-README.md`
