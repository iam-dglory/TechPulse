// app/api/companies/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '../../../../lib/supabase/server';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  logo_url: z.string().url().optional(),
  verification_tier: z.enum(['certified','trusted','exemplary','pioneer']).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServer();
    const id = params.id;
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const payload = updateSchema.parse(body);

    const supabase = createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Owner or admin check - simplistic example:
    const id = params.id;
    const { data: existing } = await supabase.from('companies').select('claimed_by').eq('id', id).single();
    const isOwner = existing?.claimed_by === session.user.id;
    // Replace with robust admin check
    const { data: profile } = await supabase.from('profiles').select('user_type').eq('id', session.user.id).single();
    const isAdmin = (profile as any)?.user_type === 'admin';

    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updates = { ...payload, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('companies').update(updates).eq('id', id).select().single();
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Soft delete
    const id = params.id;
    const supabase = createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('user_type').eq('id', session.user.id).single();
    const isAdmin = (profile as any)?.user_type === 'admin';
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabase.from('companies').update({ deleted_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;

    return NextResponse.json({ data, message: 'Soft deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
