// POST /api/companies/register - Company Registration with Verification
import { supabase, verifyUser } from '../_lib/supabase.js';

export default async function handler(req, res) {
  // CORS headers
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
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      // Basic Information
      name,
      email,
      phone,
      website,
      description,

      // Company Details
      industry,
      founded_year,
      company_size,
      headquarters_address,
      headquarters_country,
      headquarters_city,

      // Credentials (for verification)
      business_registration_number,
      tax_id,
      registration_country,

      // Representative Information
      representative_name,
      representative_email,
      representative_phone,
    } = req.body;

    // Validation
    if (!name || !email || !description || !industry) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email', 'description', 'industry']
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Create slug from company name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if company already exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id, name')
      .or(`slug.eq.${slug},email.eq.${email}`)
      .single();

    if (existingCompany) {
      return res.status(409).json({
        error: 'Company already exists',
        message: 'A company with this name or email is already registered'
      });
    }

    // Insert company
    const { data: company, error: insertError } = await supabase
      .from('companies')
      .insert([{
        name,
        slug,
        email,
        phone,
        website,
        description,
        industry,
        founded_year: founded_year ? parseInt(founded_year) : null,
        company_size,
        headquarters_address,
        headquarters_country,
        headquarters_city,
        business_registration_number,
        tax_id,
        registration_country,
        representative_name,
        representative_email,
        representative_phone,
        owner_user_id: user.id,
        verification_status: 'pending',
        credibility_score: 0,
        transparency_score: 0,
        ethics_score: 0,
        safety_score: 0,
        innovation_score: 0,
        is_active: true
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Company registration error:', insertError);
      return res.status(500).json({
        error: 'Failed to register company',
        details: insertError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Company registered successfully. Please upload verification documents to complete the process.',
      data: {
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          verification_status: company.verification_status,
          credibility_score: company.credibility_score
        },
        next_steps: [
          'Upload business registration document',
          'Upload tax ID document',
          'Upload address proof',
          'Wait for admin verification (typically 1-3 business days)'
        ]
      }
    });

  } catch (error) {
    console.error('Company registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
