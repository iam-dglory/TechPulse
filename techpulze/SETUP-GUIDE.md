# TechPulze Setup Guide

## 🚀 Quick Start

Your TechPulze Next.js 14 application has been successfully created with the following features:

### ✅ What's Been Set Up

1. **Next.js 14 App** with TypeScript and Tailwind CSS
2. **shadcn/ui Components** for beautiful UI components
3. **Supabase Integration** with typed database client
4. **Complete Database Schema** with 6 tables:

   - `companies` - Company profiles with ethical scores
   - `news_updates` - Tech news with ethical impact analysis
   - `reviews` - Community reviews with moderation
   - `user_profiles` - User roles and interests
   - `discussions` - News discussion threads
   - `user_recommendations` - Personalized content recommendations

5. **API Routes** for companies and news
6. **Sample Pages** for companies and news browsing
7. **TypeScript Types** for full type safety

## 🔧 Setup Steps

### 1. Environment Configuration

The `.env.local` file has been created. You need to update it with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_database_url
```

### 2. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy your Project URL and anon key
5. Update the `.env.local` file

### 3. Set Up Database

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the entire contents of `supabase/schema.sql`
3. Paste and run the SQL script
4. This will create all tables, indexes, and sample data

### 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 📁 Project Structure

```
techpulze/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── companies/route.ts    # Companies API
│   │   │   └── news/route.ts         # News API
│   │   ├── companies/page.tsx        # Companies page
│   │   ├── news/page.tsx             # News page
│   │   └── page.tsx                  # Home page
│   ├── lib/
│   │   └── supabase.ts              # Supabase client
│   └── types/
│       └── database.ts              # Database types
├── supabase/
│   └── schema.sql                   # Database schema
├── scripts/
│   └── setup-env.js                 # Environment setup
└── README.md                        # Project documentation
```

## 🎯 Key Features

### Ethical Scoring System

- Companies and news are scored 0-10 on ethical impact
- Factors include privacy, AI transparency, carbon footprint, data handling
- Visual progress bars show scores at a glance

### Role-Based Content

- User profiles with roles (developer, customer service, marketer, etc.)
- Interest-based filtering (AI, EV, IoT, HealthTech)
- Personalized recommendations system

### Community Features

- Company reviews with 1-5 star ratings
- News discussion threads
- Moderation system for content approval

### Modern Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Database**: PostgreSQL with Row Level Security (RLS)

## 🔍 Testing the Setup

1. **Home Page**: Visit `/` to see the landing page
2. **Companies**: Visit `/companies` to browse company profiles
3. **News**: Visit `/news` to see tech news with ethical analysis
4. **API**: Test endpoints at `/api/companies` and `/api/news`

## 🚨 Troubleshooting

### Common Issues

1. **"Setup Required" Error**:

   - Check your `.env.local` file has correct Supabase credentials
   - Ensure the database schema has been run in Supabase

2. **Database Connection Issues**:

   - Verify your Supabase project is active
   - Check that RLS policies are properly set up

3. **TypeScript Errors**:
   - Run `npm install` to ensure all dependencies are installed
   - Check that your Supabase types match the schema

### Getting Help

- Check the main `README.md` for detailed documentation
- Review the `supabase/schema.sql` for database structure
- Examine the API routes in `src/app/api/` for data operations

## 🎉 Next Steps

1. **Customize the UI**: Modify the pages and components to match your brand
2. **Add Authentication**: Implement user registration and login
3. **Enhance Features**: Add more sophisticated recommendation algorithms
4. **Deploy**: Use Vercel, Netlify, or your preferred platform

Your TechPulze application is ready to help track ethical tech companies and their impact! 🌟









