// app/api/companies/[id]/claim/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';
import { trackEvent } from '@/lib/analytics';

const claimSchema = z.object({
  role: z.string().min(1).max(100),
  email: z.string().email().optional(),
  linkedin: z.string().url().optional(),
  reason: z.string().min(10).max(500),
  company_email: z.string().email().optional(),
  documents: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['business_card', 'company_email', 'linkedin_profile', 'other']),
    description: z.string().optional()
  })).optional(),
});

// GET endpoint to check claim status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'claim');
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    
    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, claimed_by')
      .eq('id', params.id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check if user is the owner
    const isOwner = company.claimed_by === session.user.id;
    
    // Get claim history for this user and company
    const { data: claims, error: claimError } = await supabase
      .from('company_claims')
      .select('*')
      .eq('company_id', params.id)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (claimError) throw claimError;

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        claimed_by: company.claimed_by,
      },
      is_owner: isOwner,
      claims: claims || [],
      has_pending_claim: claims?.some(claim => claim.status === 'pending') || false,
    });
  } catch (err: any) {
    console.error('Company claim status error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

// POST endpoint to submit a claim
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'claim');
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    
    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { role, email, linkedin, reason, company_email, documents } = claimSchema.parse(body);

    // Check if company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, claimed_by')
      .eq('id', params.id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check if company is already claimed
    if (company.claimed_by) {
      // If claimed by the same user, return success with message
      if (company.claimed_by === session.user.id) {
        return NextResponse.json({ 
          success: true,
          message: 'You already own this company profile',
          is_owner: true
        });
      }
      
      return NextResponse.json({ error: 'Company already claimed by another user' }, { status: 400 });
    }

    // Check if user already has a pending claim for this company
    const { data: existingClaim, error: claimError } = await supabase
      .from('company_claims')
      .select('id, status')
      .eq('company_id', params.id)
      .eq('user_id', session.user.id)
      .eq('status', 'pending')
      .single();

    if (!claimError && existingClaim) {
      return NextResponse.json({ 
        error: 'You already have a pending claim for this company',
        claim_id: existingClaim.id
      }, { status: 400 });
    }

    // Create claim record
    const now = new Date().toISOString();
    const { data: claim, error: insertError } = await supabase
      .from('company_claims')
      .insert({
        company_id: params.id,
        user_id: session.user.id,
        role,
        verification_email: email,
        linkedin_url: linkedin,
        company_email: company_email,
        reason,
        documents: documents || [],
        status: 'pending',
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Create notification for admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_type', 'admin');
      
    if (admins && admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'new_claim',
        title: 'New Company Claim',
        message: `A new claim has been submitted for ${company.name}`,
        entity_type: 'company_claim',
        entity_id: claim.id,
        created_at: now
      }));
      
      await supabase.from('notifications').insert(adminNotifications);
    }

    // Track analytics event
    await trackEvent({
      event: 'company_claim',
      userId: session.user.id,
      properties: {
        company_id: params.id,
        claim_id: claim.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Claim submitted successfully and awaiting admin review',
      data: claim
    });
  } catch (err: any) {
    console.error('Company claim error:', err);
    if (err?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

// GET endpoint to check claim status
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request);
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const companyId = params.id;
    const userId = session.user.id;

    // Check if company is already claimed
    const { data: company } = await supabase
      .from('companies')
      .select('claimed_by')
      .eq('id', companyId)
      .single();

    if (company?.claimed_by) {
      const isClaimed = company.claimed_by === userId;
      return NextResponse.json({
        status: isClaimed ? 'approved' : 'claimed_by_other',
        claimed_by_you: isClaimed
      });
    }

    // Check for pending claims
    const { data: claim } = await supabase
      .from('company_claims')
      .select('id, status, created_at')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (claim) {
      return NextResponse.json({
        status: claim.status,
        claim_id: claim.id,
        created_at: claim.created_at
      });
    }

    return NextResponse.json({
      status: 'unclaimed'
    });
  } catch (err: any) {
    console.error('Claim status error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}