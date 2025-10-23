// GET /api/companies/[id]/reviews - Get Company Reviews with Pagination
import { supabase } from '../../../_lib/supabase.js';

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
    const { id } = req.query; // company_id
    const {
      page = 1,
      limit = 10,
      sort = 'recent', // recent, helpful, rating_high, rating_low
      category,
      rating
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = supabase
      .from('reviews')
      .select(`
        id,
        rating,
        title,
        content,
        category,
        helpful_count,
        verified_purchase,
        created_at,
        updated_at,
        is_edited
      `, { count: 'exact' })
      .eq('company_id', id)
      .eq('status', 'approved');

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (rating) {
      query = query.eq('rating', parseInt(rating));
    }

    // Apply sorting
    if (sort === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'helpful') {
      query = query.order('helpful_count', { ascending: false });
    } else if (sort === 'rating_high') {
      query = query.order('rating', { ascending: false });
    } else if (sort === 'rating_low') {
      query = query.order('rating', { ascending: true });
    }

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error('Reviews fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }

    // Get company info
    const { data: company } = await supabase
      .from('companies')
      .select('name, average_rating, total_reviews')
      .eq('id', id)
      .single();

    const totalPages = Math.ceil((count || 0) / limitNum);

    return res.status(200).json({
      success: true,
      data: {
        reviews: reviews || [],
        company: company || null,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          total_pages: totalPages,
          has_next: pageNum < totalPages,
          has_prev: pageNum > 1
        },
        filters: {
          sort,
          category,
          rating
        }
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
