// POST /api/companies/[id]/upload-document - Upload Verification Documents
import { supabase, verifyUser } from '../../_lib/supabase.js';

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
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.query;
    const { document_type, document_url, document_name, file_size } = req.body;

    // Validation
    if (!id || !document_type || !document_url) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['document_type', 'document_url']
      });
    }

    // Verify company ownership
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, owner_user_id, name')
      .eq('id', id)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    if (company.owner_user_id !== user.id) {
      return res.status(403).json({ error: 'You are not authorized to upload documents for this company' });
    }

    // Validate document type
    const validDocTypes = ['business_registration', 'tax_id', 'address_proof', 'other'];
    if (!validDocTypes.includes(document_type)) {
      return res.status(400).json({
        error: 'Invalid document type',
        valid_types: validDocTypes
      });
    }

    // Insert document record
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

    if (insertError) {
      console.error('Document upload error:', insertError);
      return res.status(500).json({ error: 'Failed to upload document' });
    }

    // Update company's main document URL if applicable
    const updateData = {};
    if (document_type === 'business_registration') {
      updateData.business_registration_doc = document_url;
    } else if (document_type === 'tax_id') {
      updateData.tax_id_doc = document_url;
    } else if (document_type === 'address_proof') {
      updateData.address_proof_doc = document_url;
    }

    if (Object.keys(updateData).length > 0) {
      updateData.verification_status = 'under_review';
      await supabase
        .from('companies')
        .update(updateData)
        .eq('id', id);
    }

    // Get all uploaded documents count
    const { count: docsCount } = await supabase
      .from('company_verification_docs')
      .select('id', { count: 'exact' })
      .eq('company_id', id);

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: {
          id: doc.id,
          type: doc.document_type,
          name: doc.document_name,
          status: doc.verification_status,
          uploaded_at: doc.uploaded_at
        },
        company_status: {
          name: company.name,
          documents_uploaded: docsCount,
          documents_required: 3, // business_registration, tax_id, address_proof
          can_submit_for_review: docsCount >= 3
        }
      }
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
