# TechPulze - Ethical Technology Scoring Platform

## 🚀 Deployment Guide for Vercel and Supabase

This guide provides instructions for deploying TechPulze on Vercel's free plan with Supabase as the backend.

## 📋 Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Supabase Account](https://supabase.com/)
- [OpenAI API Key](https://platform.openai.com/account/api-keys)
- [Upstash Redis Account](https://upstash.com/) (for rate limiting)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv) (for caching)

## 🔧 Environment Setup

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations from `supabase/supabase-techpulze-complete-schema.sql`
3. Apply RLS policies from `supabase/rls-policies.sql`
4. Get your Supabase URL and keys from Project Settings > API

### Environment Variables

Create a `.env.local` file with the following variables:

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
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## 🚀 Local Development

1. Clone the repository
```bash
git clone https://github.com/your-username/techpulze.git
cd techpulze
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Build and Deploy

### Local Build

```bash
npm run lint
npm run build
npm run start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel project settings
4. Deploy with the following settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

## 🔒 Supabase RLS Policies

The application uses Row Level Security (RLS) policies for data protection:

- **companies**: Public read, owner/admin update
- **reviews**: Authenticated insert, public read
- **company_claims**: Authenticated insert, admin update
- **score_history**: Public read-only
- **profiles**: Public read, owner update
- **news_articles**: Public read
- **analytics_events**: Authenticated insert

## 🧪 Testing Deployment

1. **Company Creation Flow**:
   - Create new company
   - Claim company
   - Admin approve
   - AI rescore
   - Verify score visibility

2. **Review Flow**:
   - Post review
   - Verify score auto-updates
   - Check company directory sorting

3. **Performance**:
   - Run Lighthouse test (target ≥90 on performance & accessibility)
   - Test page load times on mobile devices

## 🔍 Troubleshooting

### Common Issues

1. **API Errors**:
   - Check environment variables in Vercel
   - Verify Supabase connection
   - Check API logs in Vercel dashboard

2. **Database Issues**:
   - Verify RLS policies are correctly applied
   - Check Supabase logs for errors
   - Test database connections

3. **Authentication Problems**:
   - Clear browser cookies and local storage
   - Verify Supabase auth configuration
   - Check for CORS issues

## 📈 Monitoring

- Use Vercel Analytics for performance monitoring
- Set up Sentry for error tracking
- Monitor Supabase usage in dashboard

## 🚀 Scaling Tips (Vercel Free Plan)

- Use ISR (Incremental Static Regeneration) for popular pages
- Implement lazy loading for heavy components
- Optimize images with Next.js Image component
- Use Edge runtime where possible
- Keep bundle size under 1MB

## 📞 Support

For deployment support:
- Check this README
- Review Vercel and Supabase documentation
- Open an issue on GitHub

---

**TechPulze** - "We score technology before it's too late."