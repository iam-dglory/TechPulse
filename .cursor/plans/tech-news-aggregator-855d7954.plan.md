<!-- 855d7954-9724-4f3c-b2a5-b7b1cc391959 5bc30d3c-80a5-4a6e-ac51-629c899ae3d8 -->
# Tech News Aggregator - Full Stack Mobile App

## Project Structure

```
my-netfolio/
├── mobile/                    # React Native app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── screens/          # App screens
│   │   ├── navigation/       # Navigation setup
│   │   ├── services/         # API services
│   │   ├── context/          # Auth context
│   │   └── utils/            # Helper functions
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth & validation
│   │   ├── services/         # News API aggregators
│   │   └── config/           # DB & env config
│   └── tests/                # Jest tests
├── docker-compose.yml         # Multi-container orchestration
├── Dockerfile.backend         # Backend container
└── Dockerfile.mobile          # Mobile build container
```

## Implementation Steps

### 1. Backend Setup (Node.js + Express + MySQL)

**Create backend structure:**

- Initialize `backend/` directory with Express server
- Set up MySQL connection using `mysql2` package
- Configure environment variables (`.env` file)
- Implement database schema for users, articles, favorites, and preferences

**Database Schema:**

```sql
- users: id, email, password_hash, created_at
- articles: id, title, description, url, source, category, published_at, image_url
- favorites: user_id, article_id, created_at
- user_preferences: user_id, categories (JSON), notification_settings
```

**API Aggregation Service:**

- Create service to fetch from multiple APIs:
                                                                                                                                                                                                                                                                - NewsAPI.org (tech category)
                                                                                                                                                                                                                                                                - The Guardian API (technology section)
                                                                                                                                                                                                                                                                - Dev.to API (developer articles)
                                                                                                                                                                                                                                                                - Hacker News API
- Implement caching strategy to store articles in MySQL
- Schedule periodic updates (cron job) to refresh articles

**Core API Endpoints:**

```
POST   /api/auth/register      - User registration
POST   /api/auth/login         - User login (returns JWT)
GET    /api/articles           - Get articles (with pagination, filters)
GET    /api/articles/search    - Search articles by keyword
POST   /api/favorites          - Save favorite article
GET    /api/favorites          - Get user's favorites
DELETE /api/favorites/:id      - Remove favorite
GET    /api/categories         - Get available categories
PUT    /api/preferences        - Update user preferences
```

**Key files:**

- `backend/src/server.js` - Express app setup
- `backend/src/config/database.js` - MySQL connection
- `backend/src/middleware/auth.js` - JWT verification
- `backend/src/services/newsAggregator.js` - Multi-API fetching
- `backend/src/controllers/articleController.js` - Article logic
- `backend/src/controllers/authController.js` - Authentication logic

### 2. React Native Mobile App

**Initialize React Native project:**

- Create `mobile/` directory with React Native CLI
- Install dependencies: 
                                                                                                                                                                                                                                                                - `@react-navigation/native` (navigation)
                                                                                                                                                                                                                                                                - `@react-navigation/stack` (stack navigation)
                                                                                                                                                                                                                                                                - `axios` (API calls)
                                                                                                                                                                                                                                                                - `react-native-reanimated` (animations)
                                                                                                                                                                                                                                                                - `@react-native-async-storage/async-storage` (token storage)
                                                                                                                                                                                                                                                                - `react-native-vector-icons` (icons)

**Core Screens:**

1. **AuthScreen** - Login/Register with form validation
2. **HomeScreen** - Article feed with pull-to-refresh
3. **CategoryScreen** - Filter by AI, Gadgets, Software, etc.
4. **SearchScreen** - Search articles by keyword
5. **FavoritesScreen** - Saved articles
6. **ArticleDetailScreen** - Full article view with WebView
7. **ProfileScreen** - User preferences and settings

**Key Components:**

- `ArticleCard.js` - Animated card with image, title, source
- `CategoryFilter.js` - Horizontal scrollable category chips
- `SearchBar.js` - Debounced search input
- `LoadingSpinner.js` - Loading states
- `EmptyState.js` - No results placeholder

**Styling Approach:**

- Use React Native StyleSheet with Tailwind-inspired utility approach
- Implement custom theme with colors, spacing, typography
- Add animations using `react-native-reanimated`:
                                                                                                                                                                                                                                                                - Fade-in for article cards
                                                                                                                                                                                                                                                                - Slide transitions between screens
                                                                                                                                                                                                                                                                - Bounce effect on favorite button
                                                                                                                                                                                                                                                                - Pull-to-refresh animation

**Authentication Flow:**

- Store JWT in AsyncStorage
- Create AuthContext for global auth state
- Implement protected routes
- Auto-login on app launch if token exists

**Key files:**

- `mobile/src/navigation/AppNavigator.js` - Navigation setup
- `mobile/src/context/AuthContext.js` - Auth state management
- `mobile/src/services/api.js` - Axios instance with interceptors
- `mobile/src/screens/HomeScreen.js` - Main article feed
- `mobile/src/components/ArticleCard.js` - Article display

### 3. Testing with Jest

**Backend Tests:**

- Unit tests for controllers and services
- Integration tests for API endpoints
- Mock MySQL database for tests
- Test authentication middleware

**Test files:**

```
backend/tests/
├── unit/
│   ├── authController.test.js
│   ├── articleController.test.js
│   └── newsAggregator.test.js
├── integration/
│   ├── auth.test.js
│   ├── articles.test.js
│   └── favorites.test.js
└── setup.js
```

**Mobile Tests:**

- Component tests with React Native Testing Library
- Snapshot tests for UI components
- Mock API responses
- Test navigation flows

**Test files:**

```
mobile/src/__tests__/
├── components/
│   ├── ArticleCard.test.js
│   └── SearchBar.test.js
├── screens/
│   └── HomeScreen.test.js
└── services/
    └── api.test.js
```

### 4. Docker Configuration

**Create three containers:**

**docker-compose.yml:**

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: tech_news
      MYSQL_ROOT_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build:
      context: ./backend
      dockerfile: ../Dockerfile.backend
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: password
      JWT_SECRET: your_secret_key
    ports:
      - "5000:5000"
    depends_on:
      - mysql

  mobile-build:
    build:
      context: ./mobile
      dockerfile: ../Dockerfile.mobile
    volumes:
      - ./mobile:/app
```

**Dockerfile.backend:**

- Node.js 20 base image
- Install dependencies
- Copy source code
- Expose port 5000
- Run migrations on startup
- Start Express server

**Dockerfile.mobile:**

- Node.js base for building
- Install React Native dependencies
- Build APK/IPA for distribution

### 5. Cloud Deployment Preparation

**Generic cloud deployment setup:**

- Environment variable management
- Database connection pooling
- HTTPS/SSL configuration
- CORS setup for mobile app
- Health check endpoints
- Logging and monitoring setup

**Deployment files:**

- `.env.example` - Template for environment variables
- `deploy.sh` - Deployment script
- `README-DEPLOYMENT.md` - Deployment instructions for AWS/DigitalOcean

**Key considerations:**

- Use environment variables for all secrets
- Implement database migrations
- Set up automated backups
- Configure reverse proxy (nginx)
- Enable rate limiting
- Add request logging

### 6. Additional Features

**News API Integration:**

- Implement rate limiting to stay within API quotas
- Error handling for API failures
- Fallback to cached articles if APIs are down
- Normalize article data from different sources

**Search Functionality:**

- Full-text search in MySQL using MATCH AGAINST
- Search in title, description, and content
- Search history for users
- Autocomplete suggestions

**UI Enhancements:**

- Skeleton loaders while fetching
- Smooth page transitions
- Haptic feedback on interactions
- Dark mode support
- Swipe gestures for favorites
- Infinite scroll with pagination

**Performance Optimizations:**

- Image lazy loading
- API response caching
- Debounced search
- Optimized database queries with indexes
- Connection pooling

## Dependencies

**Backend:**

```json
{
  "express": "^4.18.0",
  "mysql2": "^3.6.0",
  "bcrypt": "^5.1.0",
  "jsonwebtoken": "^9.0.0",
  "dotenv": "^16.0.0",
  "cors": "^2.8.5",
  "axios": "^1.6.0",
  "node-cron": "^3.0.0",
  "express-validator": "^7.0.0"
}
```

**Mobile:**

```json
{
  "react": "18.2.0",
  "react-native": "0.73.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/stack": "^6.3.0",
  "axios": "^1.6.0",
  "react-native-reanimated": "^3.6.0",
  "@react-native-async-storage/async-storage": "^1.21.0",
  "react-native-vector-icons": "^10.0.0"
}
```

**Testing:**

```json
{
  "jest": "^29.7.0",
  "supertest": "^6.3.0",
  "@testing-library/react-native": "^12.4.0",
  "@testing-library/jest-native": "^5.4.0"
}
```

## Success Criteria

- ✅ Mobile app runs on iOS and Android
- ✅ Backend API handles authentication and CRUD operations
- ✅ Articles fetched from multiple sources and cached in MySQL
- ✅ Users can filter by category (AI, Gadgets, Software)
- ✅ Search functionality works with keyword matching
- ✅ Favorites system persists user preferences
- ✅ Smooth animations and transitions throughout UI
- ✅ Comprehensive test coverage (>80%)
- ✅ Docker containers build and run successfully
- ✅ Deployment documentation for cloud platforms

### To-dos

- [ ] Set up Node.js/Express backend with MySQL database connection and environment configuration
- [ ] Create MySQL database schema for users, articles, favorites, and preferences with migrations
- [ ] Implement JWT authentication system with registration, login, and middleware
- [ ] Build news aggregation service to fetch from multiple APIs (NewsAPI, Guardian, Dev.to, Hacker News)
- [ ] Create article API endpoints with pagination, filtering, and search functionality
- [ ] Implement favorites API endpoints for saving and retrieving user's favorite articles
- [ ] Initialize React Native project with navigation, dependencies, and project structure
- [ ] Build authentication screens and context with AsyncStorage token management
- [ ] Create core screens (Home, Category, Search, Favorites, Profile) with styled components
- [ ] Add animations and transitions using react-native-reanimated for smooth UX
- [ ] Connect mobile app to backend API with Axios, implement error handling and loading states
- [ ] Write Jest unit and integration tests for backend controllers and services
- [ ] Write Jest tests for React Native components and screens
- [ ] Create Docker configuration with docker-compose.yml and Dockerfiles for backend and MySQL
- [ ] Write deployment documentation and scripts for cloud platforms (AWS/DigitalOcean)