'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

// Lazy load company components
export const LazyCompanyProfilePage = dynamic(
  () => import('@/app/components/companies/CompanyProfilePage'),
  {
    loading: () => <LoadingSkeleton variant="profile" />,
    ssr: false,
  }
);

export const LazyCompaniesGrid = dynamic(
  () => import('@/components/companies/companies-grid').then(mod => ({ default: mod.CompaniesGrid })),
  {
    loading: () => <LoadingSkeleton variant="card" count={6} />,
    ssr: false,
  }
);

export const LazyClaimCompanyButton = dynamic(
  () => import('@/app/components/companies/ClaimCompanyButton'),
  {
    loading: () => <LoadingSkeleton className="h-10 w-40" />,
    ssr: false,
  }
);

// Lazy load news components
export const LazyArticleContent = dynamic(
  () => import('@/components/news/article-content').then(mod => ({ default: mod.ArticleContent })),
  {
    loading: () => <LoadingSkeleton variant="card" />,
    ssr: false,
  }
);

export const LazyRelatedArticles = dynamic(
  () => import('@/components/news/related-articles').then(mod => ({ default: mod.RelatedArticles })),
  {
    loading: () => <LoadingSkeleton variant="list" count={3} />,
    ssr: false,
  }
);

// Lazy load chart components
export const LazyScoreHistoryChart = dynamic(
  () => import('@/components/charts/ScoreHistoryChart'),
  {
    loading: () => <LoadingSkeleton className="h-64 w-full" />,
    ssr: false,
  }
);

// Lazy load UI components that are not critical for initial render
export const LazyNotificationToast = dynamic(
  () => import('@/components/ui/NotificationToast'),
  {
    ssr: false,
  }
);

// Helper component for lazy loading with custom fallback
export function LazyLoad({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <Suspense fallback={fallback || <LoadingSkeleton />}>
      {children}
    </Suspense>
  );
}