// GET /api/companies/[id]/profile - Get Complete Company Profile with Credibility Details
import { supabase } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (companyError) {
      if (companyError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Company not found' });
      }
      return res.status(500).json({ error: 'Failed to fetch company' });
    }

    // Get review statistics
    const { data: reviews, count: totalReviews } = await supabase
      .from('reviews')
      .select('rating, category, created_at', { count: 'exact' })
      .eq('company_id', id)
      .eq('status', 'approved');

    // Calculate rating distribution
    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    reviews?.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating]++;
      }
    });

    // Get category-wise ratings
    const categoryRatings = {};
    reviews?.forEach(review => {
      if (review.category) {
        if (!categoryRatings[review.category]) {
          categoryRatings[review.category] = { total: 0, count: 0 };
        }
        categoryRatings[review.category].total += review.rating;
        categoryRatings[review.category].count++;
      }
    });

    const categoryAverages = {};
    Object.keys(categoryRatings).forEach(cat => {
      categoryAverages[cat] = (categoryRatings[cat].total / categoryRatings[cat].count).toFixed(2);
    });

    // Get recent reviews
    const { data: recentReviews } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        title,
        content,
        category,
        created_at,
        user_id,
        helpful_count
      `)
      .eq('company_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get verification documents count
    const { count: verifiedDocsCount } = await supabase
      .from('company_verification_docs')
      .select('id', { count: 'exact' })
      .eq('company_id', id)
      .eq('verification_status', 'approved');

    // Build complete profile
    const profile = {
      // Basic Info
      id: company.id,
      name: company.name,
      slug: company.slug,
      email: company.email,
      phone: company.phone,
      website: company.website,
      description: company.description,
      logo_url: company.logo_url,

      // Details
      industry: company.industry,
      founded_year: company.founded_year,
      company_size: company.company_size,
      headquarters: {
        address: company.headquarters_address,
        country: company.headquarters_country,
        city: company.headquarters_city
      },

      // Verification Status
      verification: {
        status: company.verification_status,
        verified_at: company.verified_at,
        verified_documents_count: verifiedDocsCount || 0,
        is_verified: company.verification_status === 'verified'
      },

      // Credibility Scores
      credibility: {
        overall_score: parseFloat(company.credibility_score) || 0,
        transparency_score: parseFloat(company.transparency_score) || 0,
        ethics_score: parseFloat(company.ethics_score) || 0,
        safety_score: parseFloat(company.safety_score) || 0,
        innovation_score: parseFloat(company.innovation_score) || 0,

        // Score interpretation
        rating_label: getScoreLabel(company.credibility_score),
        rating_color: getScoreColor(company.credibility_score)
      },

      // Review Statistics
      reviews: {
        total: totalReviews || 0,
        positive: company.positive_reviews || 0,
        negative: company.negative_reviews || 0,
        neutral: company.neutral_reviews || 0,
        average_rating: parseFloat(company.average_rating) || 0,
        rating_distribution: ratingDistribution,
        category_averages: categoryAverages,
        recent_reviews: recentReviews || []
      },

      // Social
      social: {
        followers_count: company.followers_count || 0,
        views_count: company.views_count || 0,
        featured: company.featured || false
      },

      // Timestamps
      created_at: company.created_at,
      updated_at: company.updated_at
    };

    // Increment view count
    await supabase
      .from('companies')
      .update({ views_count: (company.views_count || 0) + 1 })
      .eq('id', id);

    return res.status(200).json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Get company profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper functions
function getScoreLabel(score) {
  score = parseFloat(score) || 0;
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Average';
  return 'Needs Improvement';
}

function getScoreColor(score) {
  score = parseFloat(score) || 0;
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}
