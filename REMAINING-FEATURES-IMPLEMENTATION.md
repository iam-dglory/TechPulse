# TechPulze - Remaining Features Implementation Guide

## ✅ What's Been Completed

### API Routes
1. ✅ **Companies API** - `app/api/companies/route.ts` + `app/api/companies/[id]/route.ts`
2. ✅ **News API** - `app/api/news/route.ts` + `app/api/news/[slug]/route.ts`

### Pages
1. ✅ **Landing Page** - `app/page.tsx`
2. ✅ **News Feed Page** - `app/news/page.tsx` (IN PROGRESS)

### Components
1. ✅ Hero Section, Stats Counter, Trending Companies, Features Grid
2. ✅ News Filters, Featured Story (IN PROGRESS)

---

## 📋 Remaining Implementation Plan

### Priority 1: Complete News Feature (2-3 hours)

#### 1. News Feed Grid Component
**File:** `components/news/news-feed-grid.tsx`

```typescript
'use client';

import { ArticleCard } from './article-card';
import { Pagination } from '@/components/ui/pagination';
import type { NewsArticle } from '@/types/database';

interface NewsFeedGridProps {
  articles: NewsArticle[];
  total: number;
  currentPage: number;
}

export function NewsFeedGrid({ articles, total, currentPage }: NewsFeedGridProps) {
  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No articles found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/news"
        />
      )}
    </>
  );
}
```

#### 2. Article Card Component
**File:** `components/news/article-card.tsx`

```typescript
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import type { NewsArticle } from '@/types/database';

export function ArticleCard({ article }: { article: NewsArticle }) {
  const getImpactColor = (impact: string) => {
    const colors = {
      very_positive: 'text-green-600 bg-green-100',
      positive: 'text-green-500 bg-green-50',
      neutral: 'text-slate-600 bg-slate-100',
      negative: 'text-orange-600 bg-orange-100',
      very_negative: 'text-red-600 bg-red-100',
    };
    return colors[impact as keyof typeof colors] || colors.neutral;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={`/news/${article.slug}`}>
        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow h-full">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
            {article.thumbnail_url ? (
              <Image
                src={article.thumbnail_url}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">📰</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Impact Badge */}
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-3 ${getImpactColor(article.ethics_impact)}`}>
              <TrendingUp className="w-3 h-3" />
              {article.ethics_impact.replace('_', ' ')}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {article.title}
            </h3>

            {/* Summary */}
            {article.summary && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {article.summary}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(article.published_at)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {article.discussion_count}
                </span>
              </div>
              <div className="text-blue-600 dark:text-blue-400 font-medium">
                Credibility: {article.credibility_score.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}
```

#### 3. Article Detail Page
**File:** `app/news/[slug]/page.tsx`

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArticleHeader } from '@/components/news/article-header';
import { ArticleContent } from '@/components/news/article-content';
import { AnalysisBox } from '@/components/news/analysis-box';
import { RelatedArticles } from '@/components/news/related-articles';

async function getArticle(slug: string) {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from('news_articles')
    .select(`
      *,
      companies:company_ids (
        id, name, slug, logo_url, overall_score
      )
    `)
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);

  if (!article) notFound();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <ArticleHeader article={article} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <ArticleContent content={article.content} />
          </div>

          <aside className="space-y-6">
            <AnalysisBox article={article} />
            <RelatedArticles companyIds={article.company_ids} />
          </aside>
        </div>
      </article>
    </main>
  );
}
```

---

### Priority 2: User Dashboard (3-4 hours)

#### Implementation Files Needed:
1. `app/dashboard/page.tsx` - Main dashboard
2. `components/dashboard/activity-feed.tsx` - Activity timeline
3. `components/dashboard/followed-companies-carousel.tsx` - Horizontal scroll
4. `components/dashboard/stats-grid.tsx` - User statistics
5. `components/dashboard/achievements-grid.tsx` - Badges display
6. `components/dashboard/recommendations.tsx` - AI recommendations

**Key Features:**
- Protected route with middleware
- Real-time updates using Supabase Realtime
- Personalized feed based on followed companies
- Achievement tracking with progress bars
- Quick actions sidebar

---

### Priority 3: Advanced Search (3-4 hours)

#### Implementation Files Needed:
1. `app/search/page.tsx` - Search results page
2. `components/search/search-bar.tsx` - Autocomplete input
3. `components/search/filter-panel.tsx` - Advanced filters sidebar
4. `components/search/search-results.tsx` - Results grid
5. `components/search/saved-searches.tsx` - Saved searches feature

**Key Features:**
- Full-text search using PostgreSQL tsvector
- Autocomplete with debouncing
- Multi-faceted filtering (industry, score, funding, etc.)
- Highlighted matching terms
- URL state for shareability
- Save search functionality (premium)

---

### Priority 4: Comparison Tool (2-3 hours)

#### Implementation Files Needed:
1. `app/compare/page.tsx` - Comparison page
2. `components/compare/company-selector.tsx` - Search and add companies
3. `components/compare/comparison-table.tsx` - Side-by-side table
4. `components/compare/export-buttons.tsx` - PDF/Share export
5. `lib/pdf-generator.ts` - PDF generation utility

**Key Features:**
- Compare up to 4 companies
- Visual comparison with progress bars
- Highlight best/worst in each category
- AI recommendation based on comparison
- Export as PDF or shareable link

---

### Priority 5: Community Discussions (4-5 hours)

#### Implementation Files Needed:
1. `app/community/page.tsx` - Discussion list
2. `app/community/[id]/page.tsx` - Discussion detail
3. `components/community/discussion-list.tsx` - Thread list
4. `components/community/discussion-card.tsx` - Thread card
5. `components/community/comment-thread.tsx` - Nested comments (recursive)
6. `components/community/create-discussion-modal.tsx` - Create new thread
7. `components/community/rich-text-editor.tsx` - Markdown editor
8. `components/community/category-sidebar.tsx` - Category filters

**Key Features:**
- Nested comments with infinite depth
- Upvote/downvote system with optimistic updates
- Real-time new reply indicators
- Expert verified answers
- Rich text with markdown support
- Tag companies and users
- Quote functionality

---

## 🔧 Required Dependencies

Add these to `package.json`:

```json
{
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "@supabase/supabase-js": "^2.38.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.292.0",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zod": "^3.22.0",
    "@upstash/redis": "^1.25.0",
    "@upstash/ratelimit": "^0.4.0",
    "jspdf": "^2.5.1",
    "react-markdown": "^9.0.0",
    "react-syntax-highlighter": "^15.5.0"
  }
}
```

---

## 📊 Database Queries Reference

### Get User Dashboard Data
```typescript
// Fetch user's followed companies with latest updates
const { data: followedCompanies } = await supabase
  .from('user_follows')
  .select(`
    company_id,
    companies (
      id, name, slug, logo_url, overall_score, growth_rate
    )
  `)
  .eq('user_id', userId);

// Fetch user's activity
const { data: userReviews } = await supabase
  .from('reviews')
  .select('id, company_id, rating, helpful_count, created_at')
  .eq('user_id', userId)
  .eq('status', 'approved');

// Fetch achievements
const { data: achievements } = await supabase
  .from('achievements')
  .select('*')
  .eq('user_id', userId);
```

### Search Implementation
```typescript
// Full-text search
const { data: results } = await supabase
  .from('companies')
  .select('*')
  .textSearch('tsv', query, {
    type: 'websearch',
    config: 'english'
  })
  .limit(20);
```

### Comparison Query
```typescript
// Get multiple companies by IDs
const { data: companies } = await supabase
  .from('companies')
  .select('*')
  .in('id', companyIds);
```

### Discussion Threads
```typescript
// Get discussion with nested replies
const { data: discussion } = await supabase
  .from('discussions')
  .select(`
    *,
    user:profiles (username, avatar_url),
    replies:discussion_replies (
      *,
      user:profiles (username, avatar_url),
      parent_reply:discussion_replies (id)
    )
  `)
  .eq('id', discussionId)
  .single();
```

---

## 🎨 Component Patterns

### Server Component Pattern
```typescript
// app/feature/page.tsx
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}
```

### Client Component with State
```typescript
'use client';

import { useState } from 'react';

export function Component({ initialData }) {
  const [data, setData] = useState(initialData);

  return <div>...</div>;
}
```

### Optimistic Updates Pattern
```typescript
'use client';

import { useOptimistic } from 'react';

export function VoteButton({ initialVotes }) {
  const [optimisticVotes, addOptimisticVote] = useOptimistic(
    initialVotes,
    (state, amount) => state + amount
  );

  const handleVote = async () => {
    addOptimisticVote(1);
    await fetch('/api/vote', { method: 'POST' });
  };

  return <button onClick={handleVote}>{optimisticVotes}</button>;
}
```

---

## 🚀 Next Steps

### Immediate (This Session):
1. ✅ Complete news feed components
2. ⏳ Test news API endpoints
3. ⏳ Verify database queries work

### Short Term (Next 2-3 days):
1. Build user dashboard
2. Implement advanced search
3. Create comparison tool

### Medium Term (Next week):
1. Build community discussions
2. Add authentication flow
3. Implement notifications

### Long Term (Next 2 weeks):
1. Add AI analysis features
2. Build admin panel
3. Implement analytics dashboard
4. Add email notifications
5. Create mobile app views

---

## 📝 Testing Checklist

After each feature:
- [ ] API endpoints return correct data
- [ ] Loading states work properly
- [ ] Error handling displays user-friendly messages
- [ ] Mobile responsive design works
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Performance (page load under 2s)
- [ ] SEO metadata present

---

## 🎯 Success Metrics

Track these after launch:
1. Daily Active Users (DAU)
2. Companies reviewed per user
3. Discussion engagement rate
4. Search success rate
5. Comparison tool usage
6. Page load times
7. API response times

---

**You have a solid foundation! Continue building features incrementally and test thoroughly at each step.** 🚀
