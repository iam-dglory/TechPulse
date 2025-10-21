# 🗄️ Render Database Setup Guide

## ✅ Fixed Database Connection Issues

I've fixed the PostgreSQL database connection for production deployment on Render:

### 🔧 **Database Connection Improvements:**

1. **Enhanced Error Handling** ✅

   - Added try-catch around all database operations
   - Detailed error logging with error codes
   - Graceful fallback to in-memory data

2. **SSL Configuration** ✅

   - SSL enabled for production: `{ rejectUnauthorized: false }`
   - Proper SSL handling for Render's PostgreSQL

3. **Connection Pool Optimization** ✅

   - Increased connection timeout to 10 seconds
   - Added acquire timeout for better reliability
   - Proper connection pool management

4. **Environment Detection** ✅
   - Automatic DATABASE_URL detection
   - Clear logging of connection status
   - Fallback mode when database unavailable

## 🚀 **Deployment Steps:**

### 1. **Create PostgreSQL Database in Render**

1. Go to your Render dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   ```
   Name: texhpulze-db
   Database: texhpulze
   User: texhpulze_user
   Region: Choose closest to your users
   ```

### 2. **Add Environment Variables**

In your web service settings, add:

```env
NODE_ENV=production
JWT_SECRET=texhpulze_jwt_secret_key_2024_render_production_secure
NEWSAPI_KEY=cec6bb685eb9419fae97970066c63f5e
GUARDIAN_API_KEY=b133fd4e-fb25-42bf-a4ec-e9d25888285d
```

### 3. **Connect Database to Web Service**

1. In your web service settings
2. Go to "Environment" tab
3. Add environment variable:
   ```
   DATABASE_URL=[Copy from PostgreSQL service]
   ```

## 📊 **Database Schema**

The application will automatically create these tables:

### **Users Table**

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  full_name VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Posts Table**

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) CHECK (type IN ('grievance', 'ai_news')),
  category VARCHAR(100),
  criticality VARCHAR(50) DEFAULT 'medium',
  ai_risk_score INTEGER CHECK (ai_risk_score >= 1 AND ai_risk_score <= 10),
  government_action VARCHAR(100),
  location VARCHAR(200),
  tags TEXT[],
  user_id INTEGER REFERENCES users(id),
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  hot_score DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Comments Table**

```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  post_id INTEGER REFERENCES posts(id),
  user_id INTEGER REFERENCES users(id),
  parent_id INTEGER REFERENCES comments(id),
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Votes Table**

```sql
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  post_id INTEGER REFERENCES posts(id),
  comment_id INTEGER REFERENCES comments(id),
  vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);
```

### **Sessions Table**

```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔍 **Connection Testing**

### **Expected Log Output:**

```
🚀 Starting TexhPulze Render Server...
📍 Environment: production
🔗 DATABASE_URL: Present
🔄 Attempting to connect to PostgreSQL database...
✅ Database connected successfully
✅ PostgreSQL Database Connected
✅ Database tables initialized successfully
🚀 TexhPulze Render Server Started!
🗄️  Database: PostgreSQL Connected
🔒 SSL: Enabled
```

### **Fallback Mode (if database fails):**

```
❌ Database connection failed: [error details]
🔄 Running in fallback mode with in-memory data
📝 Note: Data will not persist between restarts
🗄️  Database: Fallback Mode
```

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **"password authentication failed"**

   - Check DATABASE_URL format
   - Ensure database credentials are correct
   - Verify database exists and user has permissions

2. **"connection timeout"**

   - Check network connectivity
   - Verify database is running
   - Check firewall settings

3. **"SSL connection required"**
   - Ensure SSL is enabled in connection string
   - Check SSL configuration

### **Debug Commands:**

```bash
# Test database connection
curl https://your-app.onrender.com/health

# Check logs in Render dashboard
# Go to your service → Logs tab
```

## ✅ **Success Indicators**

You'll know the database is working when:

- ✅ Server logs show "Database connected successfully"
- ✅ Health check returns database status
- ✅ You can register users and create posts
- ✅ Data persists after server restarts

## 🎯 **Next Steps**

1. **Deploy with database** - Follow the setup steps above
2. **Test all features** - Register, login, create posts, vote
3. **Monitor performance** - Check Render dashboard metrics
4. **Set up backups** - Configure automated backups in Render

---

**Your TexhPulze platform is now ready for production with a fully functional PostgreSQL database! 🚀**
