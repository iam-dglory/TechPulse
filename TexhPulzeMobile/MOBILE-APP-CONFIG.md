# TexhPulze Mobile App Configuration Guide

This guide explains the configuration and setup for the TexhPulze mobile application built with React Native and Expo.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd TexhPulzeMobile
npm install
```

### 2. Set Environment Variables

```bash
# For development
export API_BASE_URL="http://localhost:5000/api"

# For production
export API_BASE_URL="https://texhpulze.onrender.com/api"
```

### 3. Start Development Server

```bash
# Standard Expo development server
npm start

# Development client mode
npm run start:dev

# Tunnel mode (for testing on physical devices)
npm run start:tunnel
```

## 📱 App Configuration

### App Config (`app.config.js`)

The app configuration includes:

- **Name**: "TexhPulze"
- **Slug**: "texhpulze"
- **Bundle ID**: "com.texhpulze.mobile"
- **API Base URL**: Configurable via environment variable

```javascript
export default {
  expo: {
    name: "TexhPulze",
    slug: "texhpulze",
    extra: {
      apiBaseUrl:
        process.env.API_BASE_URL || "https://texhpulze.onrender.com/api",
      eas: {
        projectId: "58ff0db1-03bb-4613-8cbb-00cbf5daa4a3",
      },
    },
  },
};
```

### Package Scripts

```bash
# Development
npm start                    # Start Expo dev server
npm run start:dev           # Start with dev client
npm run start:tunnel        # Start with tunnel for device testing

# Platform-specific builds
npm run android             # Run on Android
npm run ios                 # Run on iOS
npm run web                 # Run on web

# EAS Build commands
npm run build:android       # Build for Android
npm run build:ios           # Build for iOS
npm run build:all           # Build for all platforms

# EAS Submit commands
npm run submit:android      # Submit to Google Play
npm run submit:ios          # Submit to App Store

# Prebuild commands
npm run prebuild            # Generate native code
npm run prebuild:clean      # Clean and regenerate native code
```

## 🔧 Dependencies

### Core Dependencies

- **@tanstack/react-query**: Data fetching and caching
- **axios**: HTTP client for API requests
- **expo-secure-store**: Secure token storage
- **lru-cache**: Client-side caching
- **react-navigation**: Navigation between screens

### Development Dependencies

- **@types/lru-cache**: TypeScript types for LRU cache
- **typescript**: Type safety

## 📊 Configuration Utilities

### App Configuration (`src/config/app.ts`)

```typescript
import Constants from "expo-constants";

export function getAppConfig(): AppConfig {
  const extra = Constants.expoConfig?.extra || {};

  return {
    apiBaseUrl: extra.apiBaseUrl || "https://texhpulze.onrender.com/api",
    environment: __DEV__ ? "development" : "production",
    debug: __DEV__,
  };
}
```

### Secure Storage (`src/utils/secureStorage.ts`)

```typescript
import * as SecureStore from "expo-secure-store";

// Automatically falls back to AsyncStorage if SecureStore unavailable
await secureStorage.setAuthToken(token);
const token = await secureStorage.getAuthToken();
await secureStorage.removeAuthToken();
```

### LRU Cache (`src/utils/cache.ts`)

```typescript
import { CacheManager } from "./src/utils/cache";

// Cache API responses
const key = CacheManager.generateApiKey("/posts", { page: 1 });
CacheManager.set(apiCache, key, data, 300000); // 5 minutes
const cached = CacheManager.get(apiCache, key);
```

### React Query Provider (`src/providers/QueryProvider.tsx`)

```typescript
import { QueryProvider } from "./src/providers/QueryProvider";

// Wraps the entire app for data fetching
<QueryProvider>
  <App />
</QueryProvider>;
```

## 🔐 Environment Configuration

### Development Environment

```bash
# .env.development
API_BASE_URL=http://localhost:5000/api
DEBUG=true
```

### Production Environment

```bash
# .env.production
API_BASE_URL=https://texhpulze.onrender.com/api
DEBUG=false
```

### EAS Secrets (Production)

```bash
# Set secrets for EAS builds
eas secret:create --scope project --name API_BASE_URL --value "https://texhpulze.onrender.com/api"
```

## 🏗️ Build Configuration

### EAS Build (`eas.json`)

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "API_BASE_URL": "http://localhost:5000/api"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "API_BASE_URL": "https://texhpulze.onrender.com/api"
      }
    },
    "production": {
      "env": {
        "API_BASE_URL": "https://texhpulze.onrender.com/api"
      }
    }
  }
}
```

## 📱 Platform-Specific Configuration

### Android (`android/app/build.gradle`)

```gradle
android {
    compileSdkVersion 34

    defaultConfig {
        applicationId "com.texhpulze.mobile"
        minSdkVersion 21
        targetSdkVersion 34
    }
}
```

### iOS (`ios/TexhPulzeMobile/Info.plist`)

```xml
<key>CFBundleIdentifier</key>
<string>com.texhpulze.mobile</string>
<key>CFBundleDisplayName</key>
<string>TexhPulze</string>
```

## 🔄 API Integration

### API Service Configuration

```typescript
import { getApiBaseUrl } from "../config/app";

class ApiService {
  constructor() {
    this.baseURL = getApiBaseUrl(); // Gets from app config
  }
}
```

### React Query Integration

```typescript
import { useQuery } from "@tanstack/react-query";
import apiService from "../services/api";

function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: () => apiService.getPosts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

## 🧪 Testing Configuration

### Development Testing

```bash
# Start development server
npm start

# Test on Android emulator
npm run android

# Test on iOS simulator
npm run ios

# Test on physical device (tunnel mode)
npm run start:tunnel
```

### Production Testing

```bash
# Build preview version
npm run build:android -- --profile preview
npm run build:ios -- --profile preview

# Install on device for testing
eas build --platform android --profile preview
```

## 🚀 Deployment

### EAS Build Process

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for production
eas build --platform all --profile production
```

### App Store Submission

```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

## 🔍 Debugging

### Development Debugging

```bash
# Enable debug mode
export DEBUG=true

# View logs
expo logs

# Open React Native debugger
npm run start -- --dev
```

### Production Debugging

```bash
# View production logs
eas build:list
eas build:view [build-id]
```

## 📋 Configuration Checklist

### ✅ Pre-Development

- [ ] Install dependencies: `npm install`
- [ ] Set API_BASE_URL environment variable
- [ ] Configure app.config.js
- [ ] Set up EAS project

### ✅ Development

- [ ] Test API connectivity
- [ ] Verify secure storage
- [ ] Test cache functionality
- [ ] Validate React Query integration

### ✅ Production

- [ ] Set EAS secrets
- [ ] Configure production API URL
- [ ] Test production builds
- [ ] Validate app store configurations

## 🚨 Important Notes

### API Base URL Configuration

- **Development**: Set `API_BASE_URL=http://localhost:5000/api` for local testing
- **Production**: Set `API_BASE_URL=https://texhpulze.onrender.com/api` for production
- **EAS Secrets**: Use `eas secret:create` to set production environment variables

### Security Considerations

- Tokens are stored securely using expo-secure-store
- Falls back to AsyncStorage if SecureStore unavailable
- API requests include proper authentication headers

### Performance Optimization

- LRU cache for frequently accessed data
- React Query for efficient data fetching and caching
- Background cache warming for better UX

### Platform Compatibility

- Minimum Android SDK: 21
- Minimum iOS version: 12.0
- Supports both development and production builds

## 📞 Support

For configuration issues:

1. Check environment variables are set correctly
2. Verify API_BASE_URL is accessible
3. Ensure all dependencies are installed
4. Check EAS project configuration
5. Review build logs for specific errors

**Remember**: Always test configuration changes in development before deploying to production!
