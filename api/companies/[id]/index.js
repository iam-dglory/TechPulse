// Consolidated Company Operations - profile, follow, upload
import { supabase, verifyUser } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, action } = req.query;

  try {
    // GET /api/companies/[id]?action=profile - Get company profile
    if (req.method === 'GET' && (!action || action === 'profile')) {
      return await getCompanyProfile(req, res, id);
    }

    // POST /api/companies/[id]?action=follow - Follow company
    if (req.method === 'POST' && action === 'follow') {
      return await followCompany(req, res, id);
    }

    // DELETE /api/companies/[id]?action=follow - Unfollow company
    if (req.method === 'DELETE' && action === 'follow') {
      return await unfollowCompany(req, res, id);
    }

    // POST /api/companies/[id]?action=upload - Upload document
    if (req.method === 'POST' && action === 'upload') {
      return await uploadDocument(req, res, id);
    }

    return res.status(400).json({ error: 'Invalid action or method' });
  } catch (error) {
    console.error('Company operation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get complete company profile
async function getCompanyProfile(req, res, id) {
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !company) {
    return res.status(404).json({ error: 'Company not found' });
  }

  const { data: reviews, count: totalReviews } = await supabase
    .from('reviews')
    .select('rating, category', { count: 'exact' })
    .eq('company_id', id)
    .eq('status', 'approved');

  const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews?.forEach(r => { if (r.rating >= 1 && r.rating <= 5) ratingDist[r.rating]++; });

  await supabase.from('companies').update({ views_count: (company.views_count || 0) + 1 }).eq('id', id);

  return res.status(200).json({
    success: true,
    data: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      logo_url: company.logo_url,
      website: company.website,
      industry: company.industry,
      verification: {
        status: company.verification_status,
        is_verified: company.verification_status === 'verified'
      },
      credibility: {
        overall: parseFloat(company.credibility_score) || 0,
        transparency: parseFloat(company.transparency_score) || 0,
        ethics: parseFloat(company.ethics_score) || 0,
        safety: parseFloat(company.safety_score) || 0,
        innovation: parseFloat(company.innovation_score) || 0
      },
      reviews: {
        total: totalReviews || 0,
        average_rating: parseFloat(company.average_rating) || 0,
        rating_distribution: ratingDist
      },
      social: {
        followers: company.followers_count || 0,
        views: company.views_count || 0
      }
    }
  });
}

// Follow company
async function followCompany(req, res, id) {
  const { error: authError, user } = await verifyUser(req.headers.authorization);
  if (authError || !user) return res.status(401).json({ error: 'Authentication required' });

  const { data: company } = await supabase.from('companies').select('id, name, followers_count').eq('id', id).single();
  if (!company) return res.status(404).json({ error: 'Company not found' });

  const { data: existing } = await supabase.from('company_followers').select('id').eq('company_id', id).eq('user_id', user.id).single();
  if (existing) return res.status(409).json({ error: 'Already following' });

  await supabase.from('company_followers').insert([{ company_id: id, user_id: user.id }]);
  await supabase.from('companies').update({ followers_count: (company.followers_count || 0) + 1 }).eq('id', id);

  return res.status(200).json({
    success: true,
    message: `You are now following ${company.name}`,
    data: { following: true, followers_count: (company.followers_count || 0) + 1 }
  });
}

// Unfollow company
async function unfollowCompany(req, res, id) {
  const { error: authError, user } = await verifyUser(req.headers.authorization);
  if (authError || !user) return res.status(401).json({ error: 'Authentication required' });

  const { data: company } = await supabase.from('companies').select('id, name, followers_count').eq('id', id).single();
  if (!company) return res.status(404).json({ error: 'Company not found' });

  await supabase.from('company_followers').delete().eq('company_id', id).eq('user_id', user.id);
  await supabase.from('companies').update({ followers_count: Math.max((company.followers_count || 1) - 1, 0) }).eq('id', id);

  return res.status(200).json({
    success: true,
    message: `You have unfollowed ${company.name}`,
    data: { following: false, followers_count: Math.max((company.followers_count || 1) - 1, 0) }
  });
}

// Upload verification document
async function uploadDocument(req, res, id) {
  const { error: authError, user } = await verifyUser(req.headers.authorization);
  if (authError || !user) return res.status(401).json({ error: 'Authentication required' });

  const { document_type, document_url, document_name, file_size } = req.body;
  if (!document_type || !document_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data: company } = await supabase.from('companies').select('owner_user_id, name').eq('id', id).single();
  if (!company) return res.status(404).json({ error: 'Company not found' });
  if (company.owner_user_id !== user.id) return res.status(403).json({ error: 'Not authorized' });

  const { data: doc, error: insertError } = await supabase
    .from('company_verification_docs')
    .insert([{
      company_id: id,
      document_type,
      document_url,
      document_name,
      file_size: file_size ? parseInt(file_size) : null,
      uploaded_by: user.id,
      verification_status: 'pending'
    }])
    .select()
    .single();

  if (insertError) return res.status(500).json({ error: 'Failed to upload document' });

  return res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    data: { document: { id: doc.id, type: doc.document_type, status: doc.verification_status } }
  });
}
