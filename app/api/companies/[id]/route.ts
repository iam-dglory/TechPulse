import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// =====================================================
// ROUTE: SINGLE COMPANY API
// Handles: Get (GET), Update (PUT), Delete (DELETE)
// =====================================================

const UpdateCompanySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().min(10).optional(),
  logo_url: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
  website: z.string().url().optional(),
  employee_count: z.number().optional(),
  headquarters: z.string().optional(),
  funding_stage: z.string().optional(),
  funding_amount: z.number().optional(),
  products: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })).optional(),
  target_users: z.array(z.string()).optional(),
  official_statement: z.string().optional(),
});

// =====================================================
// GET /api/companies/[id] - Get single company details
// =====================================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Get company details with all fields
    const { data: company, error } = await supabase
      .from('companies')
      .select(`
        *,
        claimed_by_profile:profiles!claimed_by (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get user's follow status (if authenticated)
    const { data: { session } } = await supabase.auth.getSession();
    let isFollowing = false;

    if (session) {
      const { data: followData } = await supabase
        .from('user_follows')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('company_id', id)
        .single();

      isFollowing = !!followData;
    }

    // Get recent reviews count
    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', id)
      .eq('status', 'approved');

    // Increment view count (fire and forget)
    supabase
      .from('companies')
      .update({ view_count: (company.view_count || 0) + 1 })
      .eq('id', id)
      .then();

    // Track analytics event
    if (session) {
      supabase
        .from('analytics_events')
        .insert([{
          event_type: 'company_view',
          user_id: session.user.id,
          company_id: id,
          metadata: {},
        }])
        .then();
    }

    return NextResponse.json({
      success: true,
      data: {
        company,
        is_following: isFollowing,
        review_count: reviewCount || 0,
      },
    });

  } catch (error) {
    console.error('Company fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT /api/companies/[id] - Update company (Owner/Admin)
// =====================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get company to check ownership
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('claimed_by')
      .eq('id', id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if user is owner (or admin - add admin check here)
    if (company.claimed_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be the company owner' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = UpdateCompanySchema.parse(body);

    // Update company
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Company update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update company', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Company updated successfully',
      data: { company: updatedCompany },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Company update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE /api/companies/[id] - Delete company (Admin only)
// =====================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check
    // For now, allow company owner to delete
    const { data: company } = await supabase
      .from('companies')
      .select('claimed_by')
      .eq('id', id)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    if (company.claimed_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Delete company (cascades to reviews, follows, etc.)
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Company deletion error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete company', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully',
    });

  } catch (error) {
    console.error('Company deletion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
