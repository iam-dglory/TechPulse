# TexhPulze Mobile - Quick Start Guide

Get your TexhPulze mobile app running on your local device in 3 easy steps!

## 🚀 Quick Start (3 Steps)

### **Step 1: Setup Local Development**

```bash
cd TexhPulzeMobile
npm run setup:local
```

This will automatically detect your IP address and configure the API endpoint.

### **Step 2: Start Backend Server**

```bash
# In a new terminal, from project root
cd backend
npm run dev
```

### **Step 3: Start Mobile App**

```bash
# Back in TexhPulzeMobile directory
npm run start:lan
```

## 📱 Connect Your Device

1. **Install Expo Go** on your mobile device
2. **Scan the QR code** from your terminal
3. **App loads** on your device with full API connectivity!

## 🔧 Manual Configuration

If the automatic setup doesn't work, manually update your IP:

1. **Find your IP address**:

   ```bash
   # Windows
   ipconfig

   # macOS/Linux
   ifconfig | grep "inet "
   ```

2. **Update API config**:
   Edit `src/config/api.ts`:
   ```typescript
   const DEVELOPMENT_CONFIG: ApiConfig = {
     baseUrl: "http://YOUR_IP_ADDRESS:8090/api", // Replace with your IP
     timeout: 10000,
     retryAttempts: 3,
   };
   ```

## 🧪 Test Everything Works

Once the app loads on your device:

- ✅ API configuration logged in console
- ✅ Backend connectivity test passed
- ✅ Story feed loads
- ✅ User registration/login works

## 🆘 Need Help?

- **Connection issues?** Check [LOCAL-DEVELOPMENT-SETUP.md](./LOCAL-DEVELOPMENT-SETUP.md)
- **Backend not accessible?** Ensure backend is running on port 8090
- **Can't scan QR?** Try `npm run start:tunnel` instead

---

**You're all set! 🎉**

Your TexhPulze mobile app is now running locally with full backend connectivity!
