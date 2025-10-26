# TexhPulze 🌐

**World's First Public Grievance & Discussion Platform for Technology**

TexhPulze combines the power of AI news aggregation with community-driven technology grievance reporting and discussion forums. It empowers citizens, researchers, policymakers, and governments to report, discuss, and categorize technology risks using AI-powered tools.

## 🚀 Deployment

TechPulze is deployed using Vercel for the frontend and serverless functions, with Supabase providing the database, authentication, storage, and realtime features.

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/iam-dglory/TechPulse.git
   cd TechPulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase and other credentials
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Deploy to production**
   ```bash
   npm run build
   npm run start
   ```

For detailed setup instructions, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## 🎯 **Core Features**

### 📰 **AI News Aggregation** (Existing)
- Multi-source tech news from NewsAPI, Guardian, Dev.to, Hacker News
- Real-time article updates and categorization
- Search and filtering by AI, Gadgets, Software, Programming, Startups
- Personalized news feed with favorites system

### 🚨 **Technology Grievances** (New)
- **Report Tech Issues**: Citizens can report technology-related problems
- **AI Risk Categorization**: Automatic classification of grievances by risk level
- **Government Integration**: Direct reporting to relevant authorities
- **Research Database**: Anonymous data for researchers and policymakers

### 💬 **Community Discussions** (New)
- **Reddit-like Forums**: Technology discussion boards
- **Expert Panels**: Verified researchers and policymakers
- **Citizen Voices**: Community-driven technology discussions
- **Policy Discussions**: Government-policy maker interactions

### 👥 **Multi-User Ecosystem** (New)
- **Citizens**: Report issues, participate in discussions
- **Researchers**: Access anonymized data, conduct studies
- **Policymakers**: Monitor trends, engage with community
- **Governments**: Direct grievance tracking, policy responses

### 💰 **Premium Features** (New)
- **Premium Subscriptions**: Advanced analytics and insights
- **Earning Opportunities**: Revenue sharing for quality content
- **Priority Support**: Faster grievance processing
- **Advanced AI Tools**: Enhanced categorization and insights

## 🏗️ **Architecture**

```
TexhPulze/
├── mobile/                    # React Native app
│   ├── src/
│   │   ├── screens/          # App screens
│   │   │   ├── News/         # AI News (existing)
│   │   │   ├── Grievances/   # Grievance reporting
│   │   │   ├── Community/    # Discussion forums
│   │   │   ├── Premium/      # Subscription features
│   │   │   └── Profile/      # User management
│   │   ├── components/       # Reusable UI components
│   │   ├── services/         # API services
│   │   └── context/          # State management
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── models/          # Database models
│   │   ├── services/        # AI categorization, news aggregation
│   │   └── middleware/      # Auth, role-based access
├── ai-services/              # AI/ML services
│   ├── risk-categorization/  # Grievance risk analysis
│   ├── content-moderation/   # Community content filtering
│   └── trend-analysis/       # Technology trend insights
└── admin-panel/              # Government/Policymaker dashboard
    ├── grievance-management/ # Track and respond to grievances
    ├── analytics/           # Community insights
    └── policy-tools/        # Policy development tools
```

## 🎨 **User Interface**

### **Mobile App Screens:**
1. **News Feed** - AI-curated technology news
2. **Report Grievance** - Submit technology issues
3. **Community** - Discussion forums and threads
4. **My Reports** - Track submitted grievances
5. **Premium** - Subscription and earning features
6. **Profile** - User settings and role management

### **Admin Dashboard:**
1. **Grievance Management** - Review and categorize reports
2. **Community Moderation** - Monitor discussions
3. **Analytics** - Technology trend insights
4. **Policy Tools** - Government response system

## 🔧 **Technology Stack**

### **Frontend (Mobile)**
- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **React Navigation** - Screen navigation
- **React Native Reanimated** - Smooth animations
- **AsyncStorage** - Local data persistence

### **Backend**
- **Node.js + Express** - API server
- **MySQL** - Primary database
- **Redis** - Caching and sessions
- **JWT** - Authentication
- **Socket.io** - Real-time updates

### **AI/ML Services**
- **OpenAI API** - Content categorization
- **TensorFlow.js** - Risk assessment models
- **NLP Processing** - Text analysis and sentiment

### **Infrastructure**
- **Docker** - Containerization
- **AWS/DigitalOcean** - Cloud deployment
- **Nginx** - Reverse proxy
- **Cloudflare** - CDN and security

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+
- Supabase account
- Vercel account
- OpenAI API key
- Upstash Redis account (for rate limiting)
- Vercel KV (for caching)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/iam-dglory/TechPulse.git
cd TechPulse
```

2. **Setup environment variables**
```bash
cp .env.example .env.local
# Configure your environment variables (see below)
```

Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_APP_NAME=TechPulze
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Install dependencies and run development server**
```bash
npm install
npm run dev
```

4. **Supabase Setup**
```bash
# Run the SQL migrations from supabase/supabase-techpulze-complete-schema.sql
# Apply RLS policies from supabase/rls-policies.sql
```

5. **Deploy to Vercel**
See detailed instructions in [README-VERCEL.md](README-VERCEL.md)

## 📊 **Database Schema**

### **Core Tables**
```sql
-- Users with role-based access
users (id, email, username, role, subscription_tier, created_at)

-- Technology news articles
articles (id, title, content, source, category, published_at, created_at)

-- Grievance reports
grievances (id, user_id, title, description, category, risk_level, status, created_at)

-- Community discussions
discussions (id, user_id, title, content, category, upvotes, created_at)

-- Comments and replies
comments (id, discussion_id, user_id, content, upvotes, created_at)

-- Premium subscriptions
subscriptions (id, user_id, plan_type, status, expires_at, created_at)

-- Earning tracking
earnings (id, user_id, amount, source, status, created_at)
```

## 💰 **Monetization Model**

### **Premium Subscriptions**
- **Basic** - Free access to news and basic grievances
- **Pro** - Advanced analytics, priority support ($9.99/month)
- **Enterprise** - Government/researcher tools ($49.99/month)

### **Earning Opportunities**
- **Content Creators** - Revenue sharing for quality discussions
- **Expert Contributors** - Payment for verified insights
- **Community Moderators** - Earnings for moderation work
- **Research Partners** - Data licensing revenue

## 🎯 **Target Users**

### **Primary Users**
- **Tech Citizens** - Report issues, participate in discussions
- **Researchers** - Access data, conduct studies
- **Policymakers** - Monitor trends, engage community
- **Government Officials** - Track grievances, respond to issues

### **Secondary Users**
- **Tech Companies** - Monitor public sentiment
- **Journalists** - Access community insights
- **Academics** - Research technology impact
- **Activists** - Organize around tech issues

## 🔒 **Privacy & Security**

- **Data Anonymization** - Personal data protection
- **Role-based Access** - Secure user permissions
- **End-to-end Encryption** - Secure communications
- **GDPR Compliance** - Privacy regulations
- **Audit Trails** - Complete activity logging

## 📈 **Future Roadmap**

### **Phase 1** (Current)
- ✅ AI News Aggregation
- ✅ Basic grievance reporting
- ✅ Community discussions
- ✅ User authentication

### **Phase 2** (Next 3 months)
- 🚧 AI risk categorization
- 🚧 Premium subscriptions
- 🚧 Government dashboard
- 🚧 Mobile app optimization

### **Phase 3** (6 months)
- 📋 Advanced analytics
- 📋 Research partnerships
- 📋 Policy integration tools
- 📋 International expansion

## 🤝 **Contributing**

We welcome contributions from:
- **Developers** - Code contributions
- **Researchers** - Data analysis and insights
- **Policymakers** - Feature requirements
- **Citizens** - User feedback and testing

## 📞 **Contact**

- **GitHub**: https://github.com/iam-dglory/TechPulse
- **Email**: techpulse@iam-dglory.dev
- **Discord**: [Join our community](https://discord.gg/techpulse)

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**TechPulse** - Empowering technology democracy through AI and community engagement 🌐✨