// GET /api/companies/list - List Companies with Filters and Pagination
import { supabase } from '../_lib/supabase.js';

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
    const {
      page = 1,
      limit = 20,
      search,
      industry,
      verification_status = 'verified', // Show only verified by default
      sort = 'score', // score, reviews, name, recent
      min_score,
      featured
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100); // Max 100 per page
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = supabase
      .from('companies')
      .select(`
        id,
        name,
        slug,
        description,
        logo_url,
        industry,
        founded_year,
        company_size,
        headquarters_country,
        headquarters_city,
        verification_status,
        verified_at,
        credibility_score,
        transparency_score,
        ethics_score,
        safety_score,
        innovation_score,
        total_reviews,
        average_rating,
        followers_count,
        featured,
        created_at
      `, { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (industry) {
      query = query.eq('industry', industry);
    }

    if (verification_status && verification_status !== 'all') {
      query = query.eq('verification_status', verification_status);
    }

    if (min_score) {
      query = query.gte('credibility_score', parseFloat(min_score));
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    // Apply sorting
    if (sort === 'score') {
      query = query.order('credibility_score', { ascending: false });
    } else if (sort === 'reviews') {
      query = query.order('total_reviews', { ascending: false });
    } else if (sort === 'name') {
      query = query.order('name', { ascending: true });
    } else if (sort === 'recent') {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: companies, error, count } = await query;

    if (error) {
      console.error('Companies list error:', error);
      return res.status(500).json({ error: 'Failed to fetch companies' });
    }

    // Transform data for frontend
    const transformedCompanies = companies?.map(company => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description?.substring(0, 200) + (company.description?.length > 200 ? '...' : ''),
      logo_url: company.logo_url,
      industry: company.industry,
      founded_year: company.founded_year,
      company_size: company.company_size,
      location: {
        city: company.headquarters_city,
        country: company.headquarters_country
      },
      verification: {
        status: company.verification_status,
        verified_at: company.verified_at,
        is_verified: company.verification_status === 'verified'
      },
      credibility: {
        overall_score: parseFloat(company.credibility_score) || 0,
        transparency: parseFloat(company.transparency_score) || 0,
        ethics: parseFloat(company.ethics_score) || 0,
        safety: parseFloat(company.safety_score) || 0,
        innovation: parseFloat(company.innovation_score) || 0
      },
      stats: {
        total_reviews: company.total_reviews || 0,
        average_rating: parseFloat(company.average_rating) || 0,
        followers: company.followers_count || 0
      },
      featured: company.featured || false,
      created_at: company.created_at
    }));

    const totalPages = Math.ceil((count || 0) / limitNum);

    return res.status(200).json({
      success: true,
      data: {
        companies: transformedCompanies || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          total_pages: totalPages,
          has_next: pageNum < totalPages,
          has_prev: pageNum > 1
        },
        filters: {
          search,
          industry,
          verification_status,
          sort,
          min_score
        }
      }
    });

  } catch (error) {
    console.error('List companies error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
