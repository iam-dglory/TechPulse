// app/api/companies/[id]/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';

// Validation schemas for each onboarding step
const basicInfoSchema = z.object({
  name: z.string().min(2).max(100),
  logo_url: z.string().url().optional(),
  cover_url: z.string().url().optional(),
  website: z.string().url(),
  industry: z.string().min(2),
  hq_location: z.string().min(2),
  step: z.literal('basic_info')
});

const teamMetricsSchema = z.object({
  employee_count: z.number().int().positive(),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()),
  funding_stage: z.enum(['bootstrapped', 'seed', 'series_a', 'series_b', 'series_c', 'public', 'acquired', 'other']),
  step: z.literal('team_metrics')
});

const policiesLinksSchema = z.object({
  privacy_policy_url: z.string().url().optional(),
  terms_url: z.string().url().optional(),
  transparency_report_url: z.string().url().optional(),
  github_url: z.string().url().optional(),
  source_repos: z.array(z.string().url()).optional(),
  step: z.literal('policies_links')
});

const proofsSchema = z.object({
  proof_documents: z.array(z.string().url()).optional(),
  public_statement: z.string().max(2000).optional(),
  step: z.literal('proofs')
});

const verificationSchema = z.object({
  step: z.literal('verification')
});

// Combined schema using discriminated union
const onboardingSchema = z.discriminatedUnion('step', [
  basicInfoSchema,
  teamMetricsSchema,
  policiesLinksSchema,
  proofsSchema,
  verificationSchema
]);

// GET endpoint to retrieve onboarding progress
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

    // Check if user is the company owner
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('claimed_by', userId)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found or you are not the owner' }, { status: 404 });
    }

    // Calculate completion percentage based on required fields
    const requiredFields = [
      'name', 'logo_url', 'website', 'industry', 'hq_location',  // Step 1
      'employee_count', 'founded_year', 'funding_stage',         // Step 2
      'privacy_policy_url'                                       // Step 3 (at least one policy required)
    ];
    
    const completedFields = requiredFields.filter(field => !!company[field]);
    const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);

    // Determine current step based on completion
    let currentStep = 'basic_info';
    if (completedFields.includes('name') && completedFields.includes('website') && completedFields.includes('industry')) {
      currentStep = 'team_metrics';
      
      if (completedFields.includes('employee_count') && completedFields.includes('founded_year')) {
        currentStep = 'policies_links';
        
        if (completedFields.includes('privacy_policy_url')) {
          currentStep = 'proofs';
          
          if (company.verification_documents?.length > 0) {
            currentStep = 'verification';
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        company,
        onboarding: {
          completion_percentage: completionPercentage,
          current_step: currentStep,
          is_verified: company.is_verified || false,
          verification_tier: company.verification_tier || 'none'
        }
      }
    });
  } catch (err: any) {
    console.error('Onboarding status error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

// PATCH endpoint to update company information during onboarding
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'auth');
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const companyId = params.id;
    const userId = session.user.id;

    // Check if user is the company owner
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, claimed_by, is_verified')
      .eq('id', companyId)
      .eq('claimed_by', userId)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found or you are not the owner' }, { status: 404 });
    }

    const body = await request.json();
    const payload = onboardingSchema.parse(body);
    
    // Prepare update data based on step
    let updateData = {};
    let eventType = '';
    
    switch (payload.step) {
      case 'basic_info':
        updateData = {
          name: payload.name,
          logo_url: payload.logo_url,
          cover_url: payload.cover_url,
          website: payload.website,
          industry: payload.industry,
          hq_location: payload.hq_location,
          updated_at: new Date().toISOString()
        };
        eventType = 'company_basic_info_updated';
        break;
        
      case 'team_metrics':
        updateData = {
          employee_count: payload.employee_count,
          founded_year: payload.founded_year,
          funding_stage: payload.funding_stage,
          updated_at: new Date().toISOString()
        };
        eventType = 'company_metrics_updated';
        break;
        
      case 'policies_links':
        updateData = {
          privacy_policy_url: payload.privacy_policy_url,
          terms_url: payload.terms_url,
          transparency_report_url: payload.transparency_report_url,
          github_url: payload.github_url,
          source_repos: payload.source_repos || [],
          updated_at: new Date().toISOString()
        };
        eventType = 'company_policies_updated';
        break;
        
      case 'proofs':
        updateData = {
          verification_documents: payload.proof_documents || [],
          public_statement: payload.public_statement,
          updated_at: new Date().toISOString()
        };
        eventType = 'company_proofs_updated';
        break;
        
      case 'verification':
        // For verification step, we just submit for review
        updateData = {
          verification_requested_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        eventType = 'company_verification_requested';
        break;
    }

    // Update company data
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Track analytics event
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      user_id: userId,
      metadata: { company_id: companyId, step: payload.step },
      created_at: new Date().toISOString()
    });

    // Calculate completion percentage for response
    const requiredFields = [
      'name', 'logo_url', 'website', 'industry', 'hq_location',
      'employee_count', 'founded_year', 'funding_stage',
      'privacy_policy_url'
    ];
    
    const completedFields = requiredFields.filter(field => !!updatedCompany[field]);
    const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);

    return NextResponse.json({
      success: true,
      message: 'Company information updated successfully',
      data: {
        company: updatedCompany,
        onboarding: {
          completion_percentage: completionPercentage,
          current_step: payload.step,
          next_step: getNextStep(payload.step)
        }
      }
    });
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    console.error('Onboarding update error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

// Helper function to determine the next step
function getNextStep(currentStep: string): string {
  const steps = ['basic_info', 'team_metrics', 'policies_links', 'proofs', 'verification', 'completed'];
  const currentIndex = steps.indexOf(currentStep);
  return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : 'completed';
}