// app/api/admin/claims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';

const listSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'all']).optional().default('pending'),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
});

const actionSchema = z.object({
  claimId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
});

// GET endpoint to list claims
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'admin');
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    
    // Admin check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();
      
    const isAdmin = profile?.user_type === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const parsed = listSchema.parse(Object.fromEntries(url.searchParams.entries()));

    // Build query
    let query = supabase
      .from('company_claims')
      .select(`
        *,
        companies:company_id (id, name, logo_url),
        profiles:user_id (id, full_name, email)
      `)
      .order('created_at', { ascending: false })
      .range((parsed.page - 1) * parsed.limit, parsed.page * parsed.limit - 1);

    // Apply status filter if not 'all'
    if (parsed.status !== 'all') {
      query = query.eq('status', parsed.status);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Get total count
    const { count } = await supabase
      .from('company_claims')
      .select('id', { count: 'exact', head: true })
      .eq('status', parsed.status === 'all' ? undefined : parsed.status);

    return NextResponse.json({
      data,
      count: count ?? null,
      page: parsed.page,
      total_pages: count ? Math.ceil(count / parsed.limit) : 1,
    });
  } catch (err: any) {
    console.error('Admin claims error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

// POST endpoint to approve or reject claims
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'admin');
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    
    // Admin check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();
      
    const isAdmin = profile?.user_type === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { claimId, action, notes } = actionSchema.parse(body);

    // Get claim details
    const { data: claim, error: claimError } = await supabase
      .from('company_claims')
      .select('id, company_id, user_id, status')
      .eq('id', claimId)
      .single();

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    if (claim.status !== 'pending') {
      return NextResponse.json({ 
        error: `This claim has already been ${claim.status}` 
      }, { status: 400 });
    }

    // Update claim status
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('company_claims')
      .update({
        status: action,
        admin_notes: notes,
        processed_by: session.user.id,
        processed_at: now,
        updated_at: now
      })
      .eq('id', claimId);

    if (updateError) throw updateError;

    // If approved, update company ownership
    if (action === 'approve') {
      const { error: companyError } = await supabase
        .from('companies')
        .update({
          claimed_by: claim.user_id,
          claimed_at: now,
          updated_at: now
        })
        .eq('id', claim.company_id);

      if (companyError) throw companyError;
      
      // Trigger AI scoring via Edge Function
      const supabaseAdmin = createSupabaseAdmin();
      await supabaseAdmin.functions.invoke('ai_score', {
        body: { companyId: claim.company_id }
      });
      
      // Create notification for user
      await supabase.from('notifications').insert({
        user_id: claim.user_id,
        type: 'claim_approved',
        title: 'Company Claim Approved',
        message: 'Your company claim has been approved. You can now manage your company profile.',
        entity_type: 'company',
        entity_id: claim.company_id,
        created_at: now
      });
    } else {
      // Create notification for rejection
      await supabase.from('notifications').insert({
        user_id: claim.user_id,
        type: 'claim_rejected',
        title: 'Company Claim Rejected',
        message: notes || 'Your company claim has been rejected. Please contact support for more information.',
        entity_type: 'company',
        entity_id: claim.company_id,
        created_at: now
      });
    }

    return NextResponse.json({
      success: true,
      message: `Claim ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });
  } catch (err: any) {
    console.error('Admin claim action error:', err);
    if (err?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}