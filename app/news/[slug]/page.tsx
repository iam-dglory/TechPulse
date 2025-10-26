import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArticleHeader } from '@/components/news/article-header';
import { LazyArticleContent, LazyRelatedArticles, LazyLoad } from '@/lib/lazy-components';
import type { Metadata, ResolvingMetadata } from 'next';

// Set edge runtime for better performance
export const runtime = 'edge';

// Enable ISR with 60 second revalidation
export const revalidate = 60;

// Fetch article data
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

// Fetch related articles
async function getRelatedArticles(slug: string, companyIds: string[]) {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from('news_articles')
    .select('id, title, slug, image_url, published_at')
    .neq('slug', slug)
    .in('company_ids', companyIds)
    .order('published_at', { ascending: false })
    .limit(3);

  if (error) return [];
  return data || [];
}

// Generate metadata for SEO
export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const article = await getArticle(params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found | TechPulze',
      description: 'The requested article could not be found.',
    };
  }
  
  return {
    title: `${article.title} | TechPulze News`,
    description: article.summary || `Read about ${article.title} on TechPulze, the platform for tech ethics and transparency.`,
    openGraph: {
      title: article.title,
      description: article.summary || `Read about ${article.title} on TechPulze.`,
      images: article.image_url ? [article.image_url] : undefined,
      type: 'article',
      publishedTime: article.published_at,
    },
  };
}

// Main article page component
export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);

  if (!article) notFound();

  // Get related articles
  const companyIds = article.company_ids || [];
  const relatedArticles = await getRelatedArticles(params.slug, companyIds);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <ArticleHeader article={article} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <LazyLoad>
              <LazyArticleContent content={article.content} />
            </LazyLoad>
          </div>

          <aside className="space-y-6">
            {relatedArticles.length > 0 && (
              <LazyLoad>
                <LazyRelatedArticles articles={relatedArticles} />
              </LazyLoad>
            )}
          </aside>
        </div>
      </article>
    </main>
  );
}