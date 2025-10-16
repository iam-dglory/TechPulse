# TexhPulze Mobile - Local Development Setup

This guide explains how to run the TexhPulze mobile app on your local device for development and testing.

## 📋 Prerequisites

- **Node.js** (18.x or 20.x)
- **Expo CLI**: `npm install -g @expo/cli`
- **Expo Go App** installed on your mobile device
- **Backend server** running on your local machine
- **Same Wi-Fi network** for both your computer and mobile device

## 🔧 Setup Steps

### 1. Configure API Endpoint

**Update your local IP address in the API configuration:**

Edit `src/config/api.ts` and update the `DEVELOPMENT_CONFIG`:

```typescript
const DEVELOPMENT_CONFIG: ApiConfig = {
  baseUrl: "http://192.168.1.100:8090/api", // Replace with YOUR local IP
  timeout: 10000,
  retryAttempts: 3,
};
```

### 2. Find Your Local IP Address

#### **Windows:**

```cmd
ipconfig
```

Look for "IPv4 Address" under your Wi-Fi adapter (usually starts with 192.168.x.x)

#### **macOS:**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

#### **Linux:**

```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### 3. Update API Configuration

Replace `192.168.1.100` with your actual IP address in:

```typescript
// src/config/api.ts
const DEVELOPMENT_CONFIG: ApiConfig = {
  baseUrl: "http://YOUR_IP_ADDRESS:8090/api",
  timeout: 10000,
  retryAttempts: 3,
};
```

### 4. Start Backend Server

Make sure your backend is running on port 8090:

```bash
# From backend directory
npm run dev
```

Verify backend is accessible:

```bash
curl http://localhost:8090/health
curl http://YOUR_IP_ADDRESS:8090/health
```

### 5. Start Mobile Development Server

```bash
# From TexhPulzeMobile directory
cd TexhPulzeMobile
npx expo start --lan --port 8095
```

**Expected output:**

```
✅ Starting Metro Bundler
✅ Expo DevTools is running at http://localhost:8095
📱 Scan QR code with Expo Go app
```

## 📱 Running on Device

### **Option 1: Expo Go App (Recommended)**

1. **Install Expo Go** on your mobile device:

   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan QR Code**:
   - Open Expo Go app
   - Scan the QR code from your terminal
   - App will load on your device

### **Option 2: Development Build**

For a more production-like experience:

```bash
# Build development client
eas build --profile development --platform android
# or
eas build --profile development --platform ios
```

## 🔍 Troubleshooting

### **Connection Issues**

#### **"Network request failed" or "Connection refused"**

1. **Check IP Address**:

   ```bash
   # Verify your IP is correct
   ping YOUR_IP_ADDRESS
   ```

2. **Check Backend Status**:

   ```bash
   curl http://YOUR_IP_ADDRESS:8090/health
   ```

3. **Firewall Settings**:

   - Ensure port 8090 is open on your machine
   - Check Windows Firewall or macOS Security settings

4. **Network Configuration**:
   - Ensure both devices are on the same Wi-Fi network
   - Try switching to mobile hotspot if Wi-Fi has restrictions

#### **"Metro bundler not responding"**

1. **Clear Metro Cache**:

   ```bash
   npx expo start --clear
   ```

2. **Reset Expo Cache**:

   ```bash
   npx expo r -c
   ```

3. **Check Port Availability**:

   ```bash
   # Windows
   netstat -an | findstr 8095

   # macOS/Linux
   lsof -i :8095
   ```

### **API Connection Issues**

#### **Backend Not Accessible**

1. **Check Backend Logs**:

   ```bash
   # In backend terminal
   npm run dev
   ```

2. **Verify Backend Configuration**:

   ```bash
   # Check if backend is listening on all interfaces
   curl http://0.0.0.0:8090/health
   ```

3. **Update Backend Host Binding**:
   In your backend server, ensure it's listening on all interfaces:
   ```javascript
   app.listen(8090, "0.0.0.0", () => {
     console.log("Server running on 0.0.0.0:8090");
   });
   ```

## 🧪 Testing API Connection

### **Built-in Connectivity Test**

The app includes a development utility to test API connectivity:

```typescript
import { DEV_UTILS } from "./src/config/api";

// Test connectivity (development only)
await DEV_UTILS.testConnectivity();
```

### **Manual Testing**

1. **Open Expo DevTools**: http://localhost:8095
2. **Check Console Logs** for API configuration
3. **Test API Calls** in the app
4. **Monitor Network Tab** in DevTools

## 📊 Development Features

### **API Configuration Logging**

In development mode, the app automatically logs API configuration:

```
🔧 API Configuration: {
  baseUrl: "http://192.168.1.100:8090/api",
  timeout: 10000,
  retryAttempts: 3,
  platform: "android",
  environment: "development"
}
```

### **Connectivity Testing**

The app includes automatic connectivity testing:

```
🌐 API Connectivity: ✅ Connected
```

### **Debug Mode**

Development features enabled:

- ✅ API request/response logging
- ✅ Error details in console
- ✅ Network status indicators
- ✅ Performance monitoring

## 🔄 Hot Reloading

The app supports hot reloading for rapid development:

- **Save any file** → Changes appear instantly
- **Shake device** → Open developer menu
- **Press 'r'** → Reload app
- **Press 'm'** → Toggle menu

## 📝 Environment Variables

### **Development Configuration**

```typescript
// src/config/api.ts
const DEVELOPMENT_CONFIG: ApiConfig = {
  baseUrl: "http://192.168.1.100:8090/api", // Your local IP
  timeout: 10000,
  retryAttempts: 3,
};
```

### **Production Configuration**

```typescript
const PRODUCTION_CONFIG: ApiConfig = {
  baseUrl: "https://texhpulze.onrender.com/api",
  timeout: 15000,
  retryAttempts: 2,
};
```

## 🚀 Next Steps

Once your local development is working:

1. **Test Core Features**:

   - User registration/login
   - Story viewing and voting
   - Company profiles
   - Daily briefs

2. **Test API Integration**:

   - Verify all endpoints work
   - Check error handling
   - Test offline functionality

3. **Performance Testing**:
   - Monitor app performance
   - Check memory usage
   - Test on different devices

## 🆘 Getting Help

If you encounter issues:

1. **Check Console Logs**: Look for error messages
2. **Verify Network**: Ensure both devices are on same network
3. **Test Backend**: Verify backend is accessible from mobile
4. **Clear Caches**: Try clearing Metro and Expo caches
5. **Restart Services**: Restart both backend and mobile server

### **Common Commands**

```bash
# Start development
npx expo start --lan --port 8095

# Clear caches and restart
npx expo start --clear --lan --port 8095

# Reset everything
npx expo r -c

# Check device connection
adb devices  # Android
xcrun simctl list devices  # iOS
```

---

**Happy coding! 🚀**

Your TexhPulze mobile app should now be running on your local device with full API connectivity!
