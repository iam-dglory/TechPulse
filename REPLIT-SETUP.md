# 🚀 TexhPulze - Replit Setup Guide

## Overview

This guide helps you set up TexhPulze in Replit environment. The project is configured to run both frontend and backend services.

## ✅ What's Been Fixed

### 1. **Replit Configuration**

- ✅ Updated `.replit` file to run backend properly
- ✅ Configured entrypoint to use `backend/src/server.replit.js`
- ✅ Set up proper run command: `cd backend && npm start`

### 2. **Database Configuration**

- ✅ Switched from MySQL to SQLite for Replit compatibility
- ✅ Created `database.replit.js` with SQLite configuration
- ✅ Updated server to use Replit-specific database setup

### 3. **App Name Updates**

- ✅ Changed from "TechPulse" to "TexhPulze" throughout
- ✅ Updated package.json, server files, and documentation
- ✅ Updated branding and configuration files

### 4. **Frontend Landing Page**

- ✅ Created beautiful landing page for root directory
- ✅ Added API status checking and system information
- ✅ Responsive design with modern styling

## 🎯 Current Status

**Backend: Ready** ✅  
**Database: SQLite configured** ✅  
**Frontend: Landing page ready** ✅  
**API: Configured for Replit** ✅

## 🚀 How to Run

### 1. **Start the Backend**

```bash
cd backend
npm install
npm start
```

### 2. **Access the Application**

- **Frontend**: http://localhost:3000 (or your Replit URL)
- **API Health**: http://localhost:3000/health
- **API Base**: http://localhost:3000/api

### 3. **Test the API**

```bash
# Health check
curl http://localhost:3000/health

# Get articles
curl http://localhost:3000/api/articles?limit=5
```

## 📱 Mobile App Integration

The backend is configured with CORS to allow connections from:

- Expo development servers
- React Native apps
- Local development (localhost:19006, 8081)

### For Mobile App Development:

1. Update the API base URL in your mobile app to point to your Replit URL
2. The backend automatically handles CORS for mobile development
3. All API endpoints are ready for mobile app consumption

## 🗄️ Database

- **Type**: SQLite (file-based, perfect for Replit)
- **Location**: `backend/data/techpulse.db`
- **Tables**: users, articles, favorites, grievances, discussions, subscriptions
- **Auto-created**: Tables are created automatically on first run

## 🔧 Configuration Files

### Key Files Updated:

- `.replit` - Replit configuration
- `backend/package.json` - Updated to use Replit server
- `backend/src/server.replit.js` - Replit-specific server
- `backend/src/config/database.replit.js` - SQLite configuration
- `src/App.jsx` - Landing page
- `src/App.css` - Modern styling

## 📊 Features Available

### Backend API:

- ✅ User authentication (JWT)
- ✅ Article management
- ✅ Favorites system
- ✅ Health monitoring
- ✅ CORS configured for mobile apps

### Frontend:

- ✅ System status dashboard
- ✅ API endpoint documentation
- ✅ Responsive design
- ✅ Real-time API status checking

## 🎨 Branding

- **App Name**: TexhPulze
- **Tagline**: "Your Gateway to Tech News"
- **Colors**: Teal (#4ECDC4), Blue (#45B7D1)
- **Style**: Modern, clean, tech-focused

## 🔗 API Endpoints

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| GET    | `/health`            | System health check      |
| GET    | `/api/articles`      | Fetch tech news articles |
| POST   | `/api/auth/register` | User registration        |
| POST   | `/api/auth/login`    | User login               |
| GET    | `/api/favorites`     | User's favorite articles |
| POST   | `/api/favorites`     | Add article to favorites |

## 🚨 Troubleshooting

### Common Issues:

1. **"Module not found" errors**

   - Run `cd backend && npm install` to install dependencies

2. **Database connection issues**

   - The SQLite database is created automatically
   - Check that `backend/data/` directory exists

3. **CORS issues with mobile app**

   - The backend is pre-configured for mobile development
   - Update your mobile app's API URL to your Replit URL

4. **Port conflicts**
   - Backend runs on port 3000 by default
   - Change PORT environment variable if needed

## 📚 Next Steps

1. **Test the backend**: Visit `/health` endpoint
2. **Fetch articles**: Test `/api/articles` endpoint
3. **Mobile development**: Use the API URL in your mobile app
4. **Deploy**: The app is ready for Replit deployment

## 🎉 Success!

Your TexhPulze app is now properly configured for Replit! The backend API is ready to serve your mobile app, and the frontend provides a beautiful landing page with system status.

---

**Built with ❤️ using React, Node.js, and SQLite**  
**Ready for mobile app development and deployment!**
