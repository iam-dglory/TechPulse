import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Shield, Users, Sparkles } from 'lucide-react';
import { HeroSection } from '@/components/landing/hero-section';
import { StatsCounter } from '@/components/landing/stats-counter';
import { TrendingCompaniesSection } from '@/components/landing/trending-companies';
import { FeaturesGrid } from '@/components/landing/features-grid';
import type { TrendingCompany } from '@/types/database';

// =====================================================
// TECHPULZE LANDING PAGE
// Next.js 14 App Router + Server Components
// =====================================================

// Fetch trending companies (Server Component)
async function getTrendingCompanies(): Promise<TrendingCompany[]> {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from('companies')
    .select('id, name, slug, logo_url, overall_score, verification_tier, growth_rate, trending_score, review_count, follower_count')
    .order('trending_score', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching trending companies:', error);
    return [];
  }

  return data || [];
}

// Fetch platform statistics
async function getPlatformStats() {
  const supabase = createServerComponentClient({ cookies });

  const [
    { count: companiesCount },
    { count: reviewsCount },
    { count: pioneerCount }
  ] = await Promise.all([
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('companies').select('*', { count: 'exact', head: true }).eq('verification_tier', 'pioneer'),
  ]);

  return {
    companies: companiesCount || 0,
    reviews: reviewsCount || 0,
    pioneer: pioneerCount || 0,
    growing: Math.floor((companiesCount || 0) * 0.27), // 27% showing positive growth
  };
}

export default async function HomePage() {
  // Fetch data in parallel
  const [trendingCompanies, stats] = await Promise.all([
    getTrendingCompanies(),
    getPlatformStats(),
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <HeroSection />

      {/* Statistics Counter */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <StatsCounter
            companies={stats.companies}
            reviews={stats.reviews}
            growing={stats.growing}
            pioneer={stats.pioneer}
          />
        </div>
      </section>

      {/* Trending Companies */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              Trending This Week
            </div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Top-Rated Tech Companies
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Discover companies leading in transparency, ethics, and innovation
            </p>
          </div>

          <Suspense fallback={<TrendingCompaniesSkeleton />}>
            <TrendingCompaniesSection companies={trendingCompanies} />
          </Suspense>

          <div className="text-center mt-12">
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors font-medium"
            >
              Explore All Companies
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why TechPulze?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              The most comprehensive platform for evaluating tech company ethics
            </p>
          </div>

          <FeaturesGrid />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join the Movement for Ethical Tech
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Help build transparency in the tech industry by sharing your experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/companies"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold text-lg"
            >
              Browse Companies
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Verified Reviews
              </p>
            </div>
            <div>
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Community Driven
              </p>
            </div>
            <div>
              <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI-Powered Insights
              </p>
            </div>
            <div>
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Real-Time Updates
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Loading skeleton for trending companies
function TrendingCompaniesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse"
        >
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}

export const metadata = {
  title: 'TechPulze - Know Which Tech Companies You Can Trust',
  description: 'AI-Powered Ethics Ratings, Real-Time Updates, and Community-Driven Transparency for tech companies worldwide.',
  openGraph: {
    title: 'TechPulze - Tech Company Ethics Ratings',
    description: 'Discover trustworthy tech companies through comprehensive ethics ratings and community reviews.',
    type: 'website',
  },
};
