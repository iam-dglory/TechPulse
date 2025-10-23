// POST /api/companies/[id]/reviews/submit - Submit Company Review
import { supabase, verifyUser } from '../../../_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const { error: authError, user } = await verifyUser(req.headers.authorization);
    if (authError || !user) {
      return res.status(401).json({ error: 'Authentication required to submit review' });
    }

    const { id } = req.query; // company_id
    const { rating, title, content, category, verified_purchase, verification_proof } = req.body;

    // Validation
    if (!rating || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['rating', 'content']
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (content.length < 50) {
      return res.status(400).json({ error: 'Review content must be at least 50 characters' });
    }

    if (content.length > 5000) {
      return res.status(400).json({ error: 'Review content must not exceed 5000 characters' });
    }

    // Check if company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, verification_status')
      .eq('id', id)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if user already reviewed this company
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('company_id', id)
      .eq('user_id', user.id)
      .single();

    if (existingReview) {
      return res.status(409).json({
        error: 'You have already reviewed this company',
        message: 'You can edit your existing review instead'
      });
    }

    // Insert review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert([{
        company_id: id,
        user_id: user.id,
        rating: parseInt(rating),
        title,
        content,
        category,
        verified_purchase: verified_purchase || false,
        verification_proof,
        status: 'pending', // All reviews go through moderation
        helpful_count: 0,
        report_count: 0
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
          title: review.title,
          status: review.status,
          created_at: review.created_at
        },
        company: {
          id: company.id,
          name: company.name
        },
        moderation_info: {
          estimated_time: '24-48 hours',
          will_notify: true
        }
      }
    });

  } catch (error) {
    console.error('Review submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
