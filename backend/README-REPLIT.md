# 🚀 TechPulse Backend - Replit Setup

This guide will help you set up and run the TechPulse backend on Replit.

## 🎯 Quick Start

### 1. Fork this Repl

1. Click the "Fork" button on this Repl
2. Wait for the dependencies to install automatically
3. The server will start automatically using the `.replit` configuration

### 2. Configure Environment Variables

1. Go to the "Secrets" tab in Replit
2. Add the following environment variables:

```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=techpulse_replit
JWT_SECRET=your-super-secure-jwt-secret-key-here
NEWSAPI_KEY=cec6bb685eb9419fae97970066c63f5e
GUARDIAN_API_KEY=b133fd4e-fb25-42bf-a4ec-e9d25888285d
DEVTO_API_KEY=your-devto-api-key
FRONTEND_URL=http://localhost:3000
```

### 3. Get API Keys

#### NewsAPI.org

1. Visit: https://newsapi.org/
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to Replit Secrets as `NEWSAPI_KEY`

#### The Guardian API

1. Visit: https://open-platform.theguardian.com/
2. Register for developer access
3. Get your API key
4. Add it to Replit Secrets as `GUARDIAN_API_KEY`

#### Dev.to API

1. Visit: https://dev.to/api
2. Sign up for an account
3. Get API key from settings
4. Add it to Replit Secrets as `DEVTO_API_KEY`

### 4. Generate JWT Secret

```bash
# In the Replit console, run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add it to Replit Secrets as `JWT_SECRET`.

## 🔧 Features

### ✅ What's Included

- **Express.js API** with CORS enabled for mobile apps
- **SQLite Database** (no external database required)
- **JWT Authentication** system
- **News Aggregation** from multiple APIs
- **Health Check** endpoint
- **Replit-Optimized** configuration
- **Auto-start** when Replit loads

### 📱 Mobile App Integration

The backend is configured to work with:

- **Expo/React Native** apps
- **Web applications**
- **Development servers**

### 🌐 API Endpoints

#### Health Check

```
GET /health
```

Returns server status and Replit information.

#### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

#### Articles

```
GET /api/articles
GET /api/articles/search
GET /api/articles/:id
```

#### Favorites

```
GET /api/favorites
POST /api/favorites
DELETE /api/favorites/:id
```

## 🚀 Running the Server

### Automatic Start

The server starts automatically when you open the Repl due to the `.replit` configuration.

### Manual Start

If you need to restart manually:

```bash
npm start
# or
npm run replit
```

### Development Mode

```bash
npm run dev
```

## 📊 Monitoring

### Health Check

Visit: `https://your-repl-url.repl.co/health`

### Console Logs

Check the Replit console for:

- ✅ Server startup messages
- 📊 Database initialization
- 🔗 API endpoints
- 📱 Mobile app connection URLs

## 🔧 Configuration Files

### `.replit`

- Auto-runs `npm start` when Replit starts
- Configures environment variables
- Enables Git integration

### `replit.nix`

- Installs Node.js LTS
- Adds MySQL client tools
- Includes development utilities

### `package.json`

- Updated with Replit-specific scripts
- Includes SQLite for local database
- All necessary dependencies

## 🗄️ Database

### SQLite (Default)

- **File**: `data/techpulse.db`
- **Tables**: users, articles, favorites, grievances, discussions, subscriptions
- **No external setup required**

### Switching to MySQL (Optional)

If you want to use MySQL instead:

1. Set up a MySQL database (PlanetScale, Railway, etc.)
2. Update environment variables
3. Use `server.js` instead of `server.replit.js`

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm run test:watch
```

## 📱 Mobile App Connection

### Expo/React Native

Update your mobile app's API base URL to:

```
https://your-repl-id.your-username.repl.co/api
```

### Example API Service Configuration

```javascript
const API_BASE_URL = "https://your-repl-id.your-username.repl.co/api";

// Test connection
fetch(`${API_BASE_URL}/health`)
  .then((response) => response.json())
  .then((data) => console.log("Backend connected:", data));
```

## 🔒 Security

### Environment Variables

- All secrets are stored in Replit Secrets
- Never commit sensitive data to code
- JWT secrets are auto-generated

### CORS Configuration

- Configured for Replit domains
- Supports Expo development URLs
- Allows credentials for authentication

## 🐛 Troubleshooting

### Server Won't Start

1. Check the console for error messages
2. Verify environment variables are set
3. Ensure all dependencies are installed

### Database Issues

1. Check if `data/` directory exists
2. Verify SQLite permissions
3. Try deleting `data/techpulse.db` to reset

### CORS Errors

1. Check the allowed origins in `server.replit.js`
2. Verify your mobile app URL is included
3. Test with curl or Postman first

### API Keys Not Working

1. Verify keys are correctly set in Replit Secrets
2. Check API key quotas and limits
3. Test keys individually with curl

## 📚 Additional Resources

- **Full Documentation**: See `README.md` for complete setup
- **Production Deployment**: See `DEPLOYMENT.md`
- **API Documentation**: Check individual route files
- **GitHub Repository**: https://github.com/iam-dglory/TechPulse

## 🎉 Success!

Once everything is running, you should see:

```
✅ TechPulse backend running on PORT: 3000
🌐 Environment: development
📊 Health check: http://localhost:3000/health
🔗 API base URL: http://localhost:3000/api
🔗 Replit URL: https://your-repl-id.your-username.repl.co
📱 Mobile app can connect to: https://your-repl-id.your-username.repl.co/api
🎉 Server is ready to handle requests!
```

Your TechPulse backend is now ready for mobile app integration! 🚀
