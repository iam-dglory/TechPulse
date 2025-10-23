// Consolidated Reviews API - list and submit reviews
import { supabase, verifyUser } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query; // company_id

  try {
    // GET /api/companies/[id]/reviews - List reviews
    if (req.method === 'GET') {
      return await listReviews(req, res, id);
    }

    // POST /api/companies/[id]/reviews - Submit review
    if (req.method === 'POST') {
      return await submitReview(req, res, id);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Reviews API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// List company reviews
async function listReviews(req, res, companyId) {
  const { page = 1, limit = 10, sort = 'recent', category, rating } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  let query = supabase
    .from('reviews')
    .select('id, rating, title, content, category, helpful_count, verified_purchase, created_at, is_edited', { count: 'exact' })
    .eq('company_id', companyId)
    .eq('status', 'approved');

  if (category) query = query.eq('category', category);
  if (rating) query = query.eq('rating', parseInt(rating));

  if (sort === 'recent') query = query.order('created_at', { ascending: false });
  else if (sort === 'helpful') query = query.order('helpful_count', { ascending: false });
  else if (sort === 'rating_high') query = query.order('rating', { ascending: false });
  else if (sort === 'rating_low') query = query.order('rating', { ascending: true });

  query = query.range(offset, offset + limitNum - 1);

  const { data: reviews, error, count } = await query;

  if (error) {
    console.error('Reviews fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }

  const { data: company } = await supabase
    .from('companies')
    .select('name, average_rating, total_reviews')
    .eq('id', companyId)
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
      }
    }
  });
}

// Submit company review
async function submitReview(req, res, companyId) {
  const { error: authError, user } = await verifyUser(req.headers.authorization);
  if (authError || !user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { rating, title, content, category, verified_purchase, verification_proof } = req.body;

  if (!rating || !content) {
    return res.status(400).json({ error: 'Missing required fields', required: ['rating', 'content'] });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  if (content.length < 50) {
    return res.status(400).json({ error: 'Review content must be at least 50 characters' });
  }

  const { data: company } = await supabase.from('companies').select('id, name').eq('id', companyId).single();
  if (!company) return res.status(404).json({ error: 'Company not found' });

  const { data: existing } = await supabase.from('reviews').select('id').eq('company_id', companyId).eq('user_id', user.id).single();
  if (existing) {
    return res.status(409).json({ error: 'You have already reviewed this company' });
  }

  const { data: review, error: insertError } = await supabase
    .from('reviews')
    .insert([{
      company_id: companyId,
      user_id: user.id,
      rating: parseInt(rating),
      title,
      content,
      category,
      verified_purchase: verified_purchase || false,
      verification_proof,
      status: 'pending',
      helpful_count: 0
    }])
    .select()
    .single();

  if (insertError) {
    console.error('Review submission error:', insertError);
    return res.status(500).json({ error: 'Failed to submit review' });
  }

  return res.status(201).json({
    success: true,
    message: 'Review submitted successfully and is pending moderation',
    data: {
      review: {
        id: review.id,
        rating: review.rating,
        status: review.status
      },
      moderation_info: {
        estimated_time: '24-48 hours'
      }
    }
  });
}
