# Environment Configuration for TexhPulze Mobile

## 🔧 Environment Variables

Create a `.env` file in the `TexhPulzeMobile` directory with the following variables:

```bash
# API Configuration
API_BASE_URL=https://texhpulze.onrender.com/api

# Development Settings
DEBUG=true
LOG_LEVEL=debug

# EAS Configuration
EAS_PROJECT_ID=58ff0db1-03bb-4613-8cbb-00cbf5daa4a3

# Build Configuration
NODE_ENV=development
```

## 🚀 Quick Setup Commands

### 1. Set Development Environment

```bash
export API_BASE_URL="http://localhost:5000/api"
export DEBUG=true
```

### 2. Set Production Environment

```bash
export API_BASE_URL="https://texhpulze.onrender.com/api"
export DEBUG=false
```

### 3. EAS Secrets for Production

```bash
# Set API URL for production builds
eas secret:create --scope project --name API_BASE_URL --value "https://texhpulze.onrender.com/api"

# Set debug flag for production
eas secret:create --scope project --name DEBUG --value "false"
```

## 📱 Platform-Specific Configuration

### Development

- **API URL**: `http://localhost:5000/api` (local development)
- **Debug**: `true`
- **Cache**: 5 minutes TTL

### Production

- **API URL**: `https://texhpulze.onrender.com/api` (Render deployment)
- **Debug**: `false`
- **Cache**: 10 minutes TTL

## 🔐 Security Notes

- API tokens are stored securely using expo-secure-store
- Environment variables are bundled into the app at build time
- Production secrets are managed through EAS
- Never commit sensitive data to version control

## ✅ Verification

Test your configuration by running:

```bash
npm start
```

The app should connect to the configured API endpoint and display the server status in the home screen.
