// Consolidated Companies API - Handles list, register, and company operations
import { supabase, verifyUser } from '../_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    // GET /api/companies?action=list - List companies
    if (req.method === 'GET' && (!action || action === 'list')) {
      return await listCompanies(req, res);
    }

    // POST /api/companies?action=register - Register company
    if (req.method === 'POST' && action === 'register') {
      return await registerCompany(req, res);
    }

    return res.status(400).json({ error: 'Invalid action or method' });
  } catch (error) {
    console.error('Companies API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// List companies with filters
async function listCompanies(req, res) {
  const {
    page = 1,
    limit = 20,
    search,
    industry,
    verification_status = 'verified',
    sort = 'score',
    min_score,
    featured
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), 100);
  const offset = (pageNum - 1) * limitNum;

  let query = supabase
    .from('companies')
    .select(`id, name, slug, description, logo_url, industry, founded_year, company_size,
      headquarters_country, headquarters_city, verification_status, verified_at,
      credibility_score, transparency_score, ethics_score, safety_score, innovation_score,
      total_reviews, average_rating, followers_count, featured, created_at`, { count: 'exact' })
    .eq('is_active', true);

  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  if (industry) query = query.eq('industry', industry);
  if (verification_status && verification_status !== 'all') query = query.eq('verification_status', verification_status);
  if (min_score) query = query.gte('credibility_score', parseFloat(min_score));
  if (featured === 'true') query = query.eq('featured', true);

  if (sort === 'score') query = query.order('credibility_score', { ascending: false });
  else if (sort === 'reviews') query = query.order('total_reviews', { ascending: false });
  else if (sort === 'name') query = query.order('name', { ascending: true });
  else if (sort === 'recent') query = query.order('created_at', { ascending: false });

  query = query.range(offset, offset + limitNum - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Companies list error:', error);
    return res.status(500).json({ error: 'Failed to fetch companies' });
  }

  const totalPages = Math.ceil((count || 0) / limitNum);

  return res.status(200).json({
    success: true,
    data: {
      companies: data || [],
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

// Register new company
async function registerCompany(req, res) {
  const { error: authError, user } = await verifyUser(req.headers.authorization);
  if (authError || !user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { name, email, phone, website, description, industry, founded_year, company_size,
    headquarters_address, headquarters_country, headquarters_city, business_registration_number,
    tax_id, registration_country, representative_name, representative_email, representative_phone
  } = req.body;

  if (!name || !email || !description || !industry) {
    return res.status(400).json({ error: 'Missing required fields', required: ['name', 'email', 'description', 'industry'] });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .or(`slug.eq.${slug},email.eq.${email}`)
    .single();

  if (existing) {
    return res.status(409).json({ error: 'Company already exists' });
  }

  const { data: company, error: insertError } = await supabase
    .from('companies')
    .insert([{
      name, slug, email, phone, website, description, industry,
      founded_year: founded_year ? parseInt(founded_year) : null,
      company_size, headquarters_address, headquarters_country, headquarters_city,
      business_registration_number, tax_id, registration_country,
      representative_name, representative_email, representative_phone,
      owner_user_id: user.id, verification_status: 'pending',
      credibility_score: 0, is_active: true
    }])
    .select()
    .single();

  if (insertError) {
    console.error('Company registration error:', insertError);
    return res.status(500).json({ error: 'Failed to register company' });
  }

  return res.status(201).json({
    success: true,
    message: 'Company registered successfully',
    data: { company: { id: company.id, name: company.name, slug: company.slug, verification_status: company.verification_status } }
  });
}
