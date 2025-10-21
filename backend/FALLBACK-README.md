# TechPulse Fallback System

## Overview

The TechPulse backend includes a comprehensive fallback system that ensures the API continues to serve data even when the database is unavailable. This system automatically detects database connection errors and serves mock data from a local JSON file.

## Features

- **Automatic Database Error Detection**: Detects various types of database connection errors
- **Fallback Data Storage**: Serves pre-defined tech news articles from `/data/fallback.json`
- **Seamless Integration**: Works transparently with existing controllers
- **Pagination Support**: Fallback data supports pagination and filtering
- **Authentication Fallback**: Provides limited authentication capabilities during outages
- **Test Endpoints**: Includes test endpoints to verify fallback functionality

## How It Works

### 1. Error Detection

The system detects database errors by checking for common error messages:

- `ECONNREFUSED` - Connection refused
- `ETIMEDOUT` - Connection timeout
- `ENOTFOUND` - Host not found
- `ER_ACCESS_DENIED_ERROR` - Access denied
- `connection lost` - Connection lost
- `mysql connection` - MySQL connection issues

### 2. Fallback Data

When a database error is detected, the system serves data from `/data/fallback.json` which contains:

- Sample tech news articles (8 articles)
- Categories (AI, Gadgets, Software, etc.)
- Demo user account
- Sample favorites
- Metadata about the fallback data

### 3. Controller Integration

Each controller automatically checks for database errors and switches to fallback mode:

```javascript
try {
  // Database operation
  const result = await pool.execute("SELECT * FROM articles");
  res.json(result);
} catch (error) {
  if (fallbackMiddleware.isDatabaseError(error)) {
    console.log("🔄 Using fallback data");
    const fallbackResult = fallbackMiddleware.getFallbackArticles(req.query);
    return res.json(fallbackResult);
  }
  throw error;
}
```

## Fallback Data Structure

```json
{
  "articles": [
    {
      "id": 1,
      "title": "OpenAI Releases GPT-5 with Enhanced Reasoning Capabilities",
      "summary": "OpenAI has announced the release of GPT-5...",
      "content": "OpenAI's latest language model...",
      "url": "https://example.com/gpt-5-release",
      "source": "TechCrunch",
      "category": "AI",
      "image_url": "https://via.placeholder.com/400x200/4ECDC4/FFFFFF?text=GPT-5+Release",
      "published_at": "2024-01-15T10:00:00Z",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "categories": ["AI", "Gadgets", "Software", "Mobile", "Web Development"],
  "users": [
    {
      "id": 1,
      "email": "demo@techpulse.app",
      "name": "Demo User",
      "role": "citizen"
    }
  ],
  "favorites": [
    {
      "id": 1,
      "user_id": 1,
      "article_id": 1
    }
  ]
}
```

## API Endpoints with Fallback

### Articles

- `GET /api/articles` - Returns fallback articles with pagination
- `GET /api/articles/search` - Searches fallback articles
- `GET /api/articles/:id` - Returns specific fallback article
- `GET /api/articles/categories` - Returns fallback categories

### Favorites

- `GET /api/favorites` - Returns user's fallback favorites
- `POST /api/favorites` - Returns error (write operations not supported in fallback)
- `DELETE /api/favorites/:id` - Returns error (write operations not supported in fallback)

### Authentication

- `POST /api/auth/login` - Limited fallback authentication for demo user
- `POST /api/auth/register` - Returns error (write operations not supported in fallback)

## Response Headers

When serving fallback data, the API includes special headers:

- `X-Fallback-Mode: true` - Indicates fallback mode is active
- `X-Fallback-Reason: [error message]` - Reason for fallback activation

## Fallback Response Format

```json
{
  "articles": [...],
  "pagination": {...},
  "fallback_mode": true,
  "message": "Serving fallback data due to database unavailability"
}
```

## Test Endpoints

In development mode, test endpoints are available:

### Test Fallback Activation

```
GET /api/test/test-fallback
```

Simulates a database error and triggers fallback mode.

### Check Fallback Data

```
GET /api/test/fallback-data
```

Returns information about the loaded fallback data.

### Test Error Detection

```
GET /api/test/test-db-errors
```

Tests database error detection for various error types.

## Demo User

The fallback system includes a demo user for testing:

- **Email**: `demo@techpulse.app`
- **Role**: `citizen`
- **ID**: `1`

## Limitations

### Read-Only Operations

Fallback mode only supports read operations:

- ✅ Get articles
- ✅ Search articles
- ✅ Get categories
- ✅ Get favorites
- ❌ Add/remove favorites
- ❌ User registration
- ❌ User preferences updates

### Authentication

- Limited to demo user only
- Fallback tokens are generated but not validated
- No password verification in fallback mode

### Data Freshness

- Fallback data is static and doesn't update
- No real-time news aggregation
- Limited to pre-defined articles

## Configuration

### Environment Variables

No additional environment variables are required. The fallback system works automatically.

### Fallback Data Location

- **File**: `backend/data/fallback.json`
- **Auto-loaded**: On server startup
- **Reloadable**: Restart server to reload fallback data

## Monitoring

### Logs

The system logs fallback activations:

```
🔄 Database error detected, switching to fallback mode: ECONNREFUSED
🔄 Using fallback data for getArticles
```

### Health Check

The `/health` endpoint continues to work during fallback mode and indicates system status.

## Testing

Run the fallback tests:

```bash
cd backend
npm test -- tests/fallback.test.js
```

## Production Considerations

1. **Data Freshness**: Consider implementing a mechanism to update fallback data periodically
2. **Monitoring**: Set up alerts for fallback mode activations
3. **Recovery**: Implement automatic database reconnection attempts
4. **Caching**: Consider caching fallback data in memory for better performance
5. **User Communication**: Inform users when fallback mode is active

## Troubleshooting

### Fallback Not Working

1. Check if `/data/fallback.json` exists and is valid JSON
2. Verify error detection is working with `/api/test/test-db-errors`
3. Check server logs for fallback activation messages

### Invalid Fallback Data

1. Validate JSON structure in `/data/fallback.json`
2. Restart server to reload fallback data
3. Check server logs for fallback data loading errors

### Performance Issues

1. Consider caching fallback data in memory
2. Optimize fallback data size
3. Implement pagination for large fallback datasets

## Future Enhancements

1. **Dynamic Fallback Data**: Update fallback data from external sources
2. **Partial Fallback**: Support for mixed database/fallback responses
3. **Fallback Metrics**: Track fallback usage and performance
4. **Auto-Recovery**: Automatic database reconnection attempts
5. **User Notifications**: Notify users when fallback mode is active
