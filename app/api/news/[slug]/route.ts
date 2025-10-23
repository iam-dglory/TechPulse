import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// =====================================================
// ROUTE: SINGLE NEWS ARTICLE API
// Handles: Get article (GET)
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { slug } = params;

    // Get article
    const { data: article, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Get related companies if any
    let companies = [];
    if (article.company_ids && article.company_ids.length > 0) {
      const { data: companiesData } = await supabase
        .from('companies')
        .select('id, name, slug, logo_url, overall_score, verification_tier')
        .in('id', article.company_ids);

      companies = companiesData || [];
    }

    // Increment view count (fire and forget)
    supabase
      .from('news_articles')
      .update({ view_count: (article.view_count || 0) + 1 })
      .eq('id', article.id)
      .then();

    // Track analytics
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      supabase
        .from('analytics_events')
        .insert([{
          event_type: 'article_view',
          user_id: session.user.id,
          metadata: { article_id: article.id, slug: article.slug },
        }])
        .then();
    }

    return NextResponse.json({
      success: true,
      data: {
        article,
        companies,
      },
    });

  } catch (error) {
    console.error('Article fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
