// app/api/ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';

const scoreSchema = z.object({
  companyId: z.string().uuid(),
  force: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting - stricter for AI operations
    const rateLimit = await rateLimitRequest(request, 'auth', 5);
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    
    // Auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { companyId, force } = scoreSchema.parse(body);

    // Check if user has permission to trigger scoring
    const { data: company } = await supabase
      .from('companies')
      .select('claimed_by, name')
      .eq('id', companyId)
      .single();
      
    // Check if user is admin or company owner
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();
      
    const isAdmin = profile?.user_type === 'admin';
    const isOwner = company?.claimed_by === session.user.id;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    // Check if we should skip scoring (not forced and recently scored)
    if (!force) {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const { data: recentScore } = await supabase
        .from('score_history')
        .select('created_at')
        .eq('company_id', companyId)
        .gt('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (recentScore) {
        return NextResponse.json({ 
          message: 'Company was scored recently. Use force=true to override.',
          last_scored_at: recentScore.created_at
        }, { status: 200 });
      }
    }
    
    // Call Supabase Edge Function for AI scoring
    const supabaseAdmin = createSupabaseAdmin();
    const { data, error } = await supabaseAdmin.functions.invoke('ai_score', {
      body: { companyId }
    });
    
    if (error) throw error;

    // Create notification for company owner upon AI rescore completion
    const now = new Date().toISOString();
    if (company?.claimed_by) {
      await supabase.from('notifications').insert({
        user_id: company.claimed_by,
        type: 'ai_rescore',
        title: 'AI Rescore Complete',
        message: `AI scoring has been updated${company?.name ? ` for ${company.name}` : ''}.`,
        entity_type: 'company',
        entity_id: companyId,
        created_at: now
      });
    }
    
    return NextResponse.json({ 
      message: 'AI scoring completed successfully',
      data
    });
  } catch (err: any) {
    console.error('AI scoring error:', err);
    if (err?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}