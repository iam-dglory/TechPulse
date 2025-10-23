import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NewsFilters } from '@/components/news/news-filters';
import { NewsFeedGrid } from '@/components/news/news-feed-grid';
import { FeaturedStory } from '@/components/news/featured-story';
import type { NewsArticle } from '@/types/database';

// =====================================================
// NEWS FEED PAGE
// Tech ethics news with filtering and analysis
// =====================================================

interface SearchParams {
  category?: string;
  time_filter?: string;
  sort?: string;
  page?: string;
}

// Fetch featured story (highest impact recent article)
async function getFeaturedStory(): Promise<NewsArticle | null> {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('ethics_impact_score', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching featured story:', error);
    return null;
  }

  return data;
}

// Fetch news articles with filters
async function getNewsArticles(params: SearchParams) {
  const supabase = createServerComponentClient({ cookies });

  const page = parseInt(params.page || '1');
  const limit = 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('news_articles')
    .select('*', { count: 'exact' });

  // Time filter
  if (params.time_filter === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    query = query.gte('published_at', weekAgo.toISOString());
  } else if (params.time_filter === 'month') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    query = query.gte('published_at', monthAgo.toISOString());
  }

  // Sorting
  switch (params.sort) {
    case 'latest':
      query = query.order('published_at', { ascending: false });
      break;
    case 'discussed':
      query = query.order('discussion_count', { ascending: false });
      break;
    case 'impact':
      query = query.order('ethics_impact_score', { ascending: false });
      break;
    default:
      query = query.order('published_at', { ascending: false });
  }

  // Exclude featured story
  const featured = await getFeaturedStory();
  if (featured) {
    query = query.neq('id', featured.id);
  }

  query = query.range(offset, offset + limit - 1);

  const { data: articles, error, count } = await query;

  if (error) {
    console.error('Error fetching articles:', error);
    return { articles: [], total: 0 };
  }

  return { articles: articles || [], total: count || 0 };
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [featuredStory, newsData] = await Promise.all([
    getFeaturedStory(),
    getNewsArticles(searchParams),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Tech Ethics News
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Real-time updates on tech company practices and accountability
            </p>
          </div>

          {/* Filters */}
          <NewsFilters />
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Story */}
        {featuredStory && (
          <section className="mb-12">
            <Suspense fallback={<FeaturedStorySkeleton />}>
              <FeaturedStory article={featuredStory} />
            </Suspense>
          </section>
        )}

        {/* News Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Latest News
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {newsData.total} articles
            </p>
          </div>

          <Suspense fallback={<NewsGridSkeleton />}>
            <NewsFeedGrid
              articles={newsData.articles}
              total={newsData.total}
              currentPage={parseInt(searchParams.page || '1')}
            />
          </Suspense>
        </section>
      </div>
    </main>
  );
}

// Loading skeletons
function FeaturedStorySkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-pulse">
      <div className="aspect-[21/9] bg-slate-200 dark:bg-slate-800" />
      <div className="p-8">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
      </div>
    </div>
  );
}

function NewsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-pulse"
        >
          <div className="aspect-video bg-slate-200 dark:bg-slate-800" />
          <div className="p-6">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-full mb-3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export const metadata = {
  title: 'Tech Ethics News - TechPulze',
  description: 'Stay updated on the latest tech company practices, accountability, and ethical concerns.',
};
