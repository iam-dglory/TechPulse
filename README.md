# TechPulze MVP 🚀

**AI-Powered Tech Company Ethics Ratings Platform**

Know which tech companies you can trust with AI-powered ethics ratings and community reviews.

![Status](https://img.shields.io/badge/Status-MVP%20Complete-success)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## 🎯 What is TechPulze?

TechPulze is a comprehensive platform for evaluating technology companies across five key ethics dimensions:

- **Privacy & Data Protection** - How companies handle user data
- **Transparency & Accountability** - Corporate openness and governance
- **Labor Practices & Diversity** - Employee treatment and inclusion
- **Environmental Impact** - Sustainability and eco-friendliness
- **Community & Social Impact** - Positive contributions to society

### Key Features

✅ **AI-Powered Scoring** - GPT-4 analyzes reviews to generate comprehensive ethics scores
✅ **Community Reviews** - Authentic reviews from employees, customers, and researchers
✅ **Real-time Updates** - Track company score changes over time
✅ **Gamification** - Earn points and badges for contributions
✅ **User Dashboard** - Personal space to track followed companies and reviews
✅ **Company Profiles** - Detailed breakdowns with score visualizations

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Framer Motion** - Smooth animations

### Backend
- **Supabase** - PostgreSQL database + Auth
- **Upstash Redis** - Caching layer (optional)
- **OpenAI GPT-4** - AI ethics scoring (optional)

### Infrastructure
- **Vercel** - Free tier hosting (12 serverless functions)
- **Vercel Edge Runtime** - Fast global CDN

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier)
- Upstash Redis account (optional)
- OpenAI API key (optional)

### 1. Install Dependencies

```bash
cd "C:/Users/GOPIKA ARAVIND/TechPulze"
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for database provisioning (2-3 minutes)
3. Go to **SQL Editor** → Click **New Query**
4. Copy the contents of `supabase-schema.sql`
5. Paste and click **Run** to create all tables and seed data

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...

# Redis (Optional - for caching)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxx...

# OpenAI (Optional - for AI scoring)
OPENAI_API_KEY=sk-proj-xxx...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
TechPulze/
├── app/
│   ├── api/                      # 12 API routes
│   │   ├── companies/            # Company CRUD + Follow
│   │   ├── reviews/              # Review CRUD + Vote
│   │   ├── ai/                   # AI scoring endpoint
│   │   ├── users/                # User profile management
│   │   └── auth/                 # OAuth callback
│   ├── companies/                # Company pages
│   │   ├── page.tsx              # Directory listing
│   │   └── [slug]/page.tsx       # Company profile
│   ├── dashboard/page.tsx        # User dashboard
│   ├── login/page.tsx            # Login page
│   ├── signup/page.tsx           # Signup page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   └── ... (8 components)
│   └── layout/
│       ├── header.tsx            # Navigation
│       └── footer.tsx            # Footer
├── lib/
│   ├── supabase/
│   │   ├── server.ts             # Server client
│   │   └── client.ts             # Browser client
│   ├── openai.ts                 # AI scoring logic
│   ├── redis.ts                  # Caching utilities
│   └── utils.ts                  # Helper functions
├── types/
│   └── database.ts               # TypeScript types
├── hooks/
│   └── use-toast.ts              # Toast notifications
├── middleware.ts                 # Auth protection
└── supabase-schema.sql           # Database schema

Total: 40+ files created
```

---

## 🎨 Pages Overview

### 🏠 Landing Page (`/`)
- Hero section with CTA buttons
- Statistics counter (companies, reviews)
- Top 3 rated companies
- Feature highlights
- Call-to-action section

### 🏢 Company Directory (`/companies`)
- Grid view of all companies
- Pagination (20 per page)
- Search and filter capabilities
- Score badges and quick stats

### 📊 Company Profile (`/companies/[slug]`)
- Detailed company information
- Overall score + 5 dimension breakdown
- Tabbed interface (Overview, Reviews, Scores)
- Follow/unfollow functionality
- Review list with helpful votes

### 🔐 Authentication
- **Login** (`/login`) - Email/password + Google OAuth
- **Signup** (`/signup`) - Create account with profile

### 📈 User Dashboard (`/dashboard`)
- User statistics (points, level, reviews)
- Recent reviews with status
- Followed companies
- Achievement badges
- Progress tracking

---

## 🔌 API Routes (12 Total)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List companies (paginated, searchable) |
| POST | `/api/companies` | Create new company |
| GET | `/api/companies/[id]` | Get company details |
| PUT | `/api/companies/[id]` | Update company |
| DELETE | `/api/companies/[id]` | Delete company |
| POST | `/api/companies/[id]/follow` | Follow/unfollow company |
| GET | `/api/reviews` | List reviews (filtered by company) |
| POST | `/api/reviews` | Create review (awards 50 points) |
| POST | `/api/reviews/[id]/vote` | Vote helpful/not helpful |
| POST | `/api/ai/score` | Calculate AI ethics scores |
| GET | `/api/users` | Get user profile |
| PUT | `/api/users` | Update user profile |
| GET | `/api/auth/callback` | OAuth callback handler |

**Note:** Vercel free tier allows exactly 12 serverless functions. We're at the limit! ✅

---

## 🗃️ Database Schema

### Core Tables (5)

**profiles** - User accounts
- `id`, `username`, `full_name`, `avatar_url`, `role`, `points`, `level`

**companies** - Tech companies
- `id`, `name`, `slug`, `logo_url`, `website`, `industry`, `description`
- `overall_score`, `privacy_score`, `transparency_score`, `labor_score`, `environment_score`, `community_score`
- `review_count`, `follower_count`

**reviews** - User reviews
- `id`, `company_id`, `user_id`
- `overall_rating`, `privacy_rating`, `transparency_rating`, `labor_rating`, `environment_rating`, `community_rating`
- `title`, `content`, `reviewer_type`, `helpful_count`, `status`

**user_follows** - Following relationships
- `id`, `user_id`, `company_id`

**review_votes** - Helpful votes
- `id`, `review_id`, `user_id`, `is_helpful`

### Features
✅ Row-Level Security (RLS) policies
✅ Auto-update triggers for company scores
✅ RPC functions (increment/decrement followers, award points)
✅ Indexes for performance
✅ Seed data (5 sample companies)

---

## 🧪 Testing the Application

### 1. Test Landing Page
```
Visit: http://localhost:3000
Expected: Hero, stats, top companies, features
```

### 2. Test Company Directory
```
Visit: http://localhost:3000/companies
Expected: Grid of companies with scores
```

### 3. Test Company Profile
```
Visit: http://localhost:3000/companies/openai
Expected: Company details, tabs, reviews
```

### 4. Test Authentication
```
1. Go to /signup
2. Create account with email/password
3. Check email for verification (optional in dev)
4. Login at /login
5. Redirected to /dashboard
```

### 5. Test User Dashboard
```
Visit: http://localhost:3000/dashboard (after login)
Expected: Stats, reviews, followed companies, achievements
```

### 6. Test API Endpoints
```bash
# Get companies
curl http://localhost:3000/api/companies

# Get single company
curl http://localhost:3000/api/companies/openai

# Get reviews
curl http://localhost:3000/api/reviews?companyId=xxx
```

---

## 🚀 Deployment to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - TechPulze MVP"
git remote add origin https://github.com/iamd-glory/techpulze.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click **New Project**
4. Import your GitHub repository
5. Add environment variables (same as `.env.local`)
6. Click **Deploy**

**Environment Variables to Add in Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `UPSTASH_REDIS_REST_URL` (optional)
- `UPSTASH_REDIS_REST_TOKEN` (optional)
- `OPENAI_API_KEY` (optional)

---

## 🎮 User Flows

### New User Journey
1. Lands on homepage → Sees top companies
2. Clicks "Get Started Free" → Signup page
3. Creates account → Email verification (optional)
4. Redirected to dashboard → Empty state
5. Clicks "Browse Companies" → Company directory
6. Finds interesting company → Views profile
7. Clicks "Follow" → Company added to dashboard
8. Clicks "Write Review" → Creates first review (earns 50 points)
9. Review goes to "pending" status → Admin approves
10. Review becomes visible → AI recalculates scores

### Reviewing a Company
1. User browses company directory
2. Clicks on company → Views profile page
3. Tabs through Overview/Reviews/Scores
4. Clicks "Write Review" (must be logged in)
5. Fills in:
   - Overall rating (1-5 stars)
   - 5 dimensional ratings (privacy, transparency, labor, environment, community)
   - Title and detailed review
   - Reviewer type (employee, customer, investor, researcher)
6. Submits review → Earns 50 points
7. Review status: "pending" → Awaits moderation
8. Admin approves → Review visible, scores update

---

## 🏆 Gamification System

### Points System
- Create review: **50 points**
- Helpful vote on your review: **5 points**
- Create discussion: **10 points** (future)
- Comment: **5 points** (future)

### Leveling Formula
```
Level = floor(sqrt(points / 50))
```

### Achievement Badges
- **First Review** - Complete your first review
- **10 Reviews** - Submit 10 reviews
- **Active Follower** - Follow 5+ companies
- **Helpful Reviewer** - Get 10+ helpful votes on a review

---

## 🔧 Troubleshooting

### Database Connection Issues
```
Error: Invalid Supabase URL
Fix: Check NEXT_PUBLIC_SUPABASE_URL in .env.local
```

### Authentication Not Working
```
Error: User not redirecting after login
Fix:
1. Check Supabase Auth settings
2. Verify redirect URLs in Supabase dashboard
3. Add http://localhost:3000/api/auth/callback to allowed URLs
```

### Build Errors
```
Error: Module not found
Fix: Run `npm install` to install all dependencies
```

### API Routes Returning 500
```
Error: Internal Server Error
Fix:
1. Check Supabase connection
2. Verify all environment variables are set
3. Check terminal logs for specific errors
```

---

## 📈 Future Enhancements

### Phase 2 (Next 1-2 months)
- [ ] Community discussions (Reddit-style forums)
- [ ] Advanced search with filters
- [ ] Company comparison tool
- [ ] Email notifications
- [ ] Admin moderation panel
- [ ] Review editing (24h window)
- [ ] Company claim process
- [ ] API rate limiting improvements

### Phase 3 (3-6 months)
- [ ] Mobile app (React Native)
- [ ] Premium subscriptions
- [ ] Advanced analytics dashboard
- [ ] Data export features
- [ ] API for third parties
- [ ] Multi-language support
- [ ] Dark mode toggle

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**TechPulze Team**
- GitHub: [@iamd-glory](https://github.com/iamd-glory)
- Website: Coming soon

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Vercel](https://vercel.com/) - Hosting platform
- [OpenAI](https://openai.com/) - AI ethics scoring

---

## 📊 Project Stats

- **Total Files Created**: 40+
- **Lines of Code**: ~5,000+
- **API Routes**: 12 (Vercel free tier limit)
- **Pages**: 7 main pages
- **Components**: 15+ reusable components
- **Build Time**: < 30 seconds
- **Bundle Size**: Optimized for performance

---

**Built with ❤️ using Next.js 15, TypeScript, and TailwindCSS**

🌟 **Star this repo if you find it helpful!**
