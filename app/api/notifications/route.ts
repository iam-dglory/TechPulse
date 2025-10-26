// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';

const listSchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  read: z.enum(['all', 'read', 'unread']).optional().default('all'),
});

const markReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).optional(),
  markAll: z.boolean().optional().default(false),
});

// GET endpoint to list user notifications
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'notifications');
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    
    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const parsed = listSchema.parse(Object.fromEntries(url.searchParams.entries()));

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range((parsed.page - 1) * parsed.limit, parsed.page * parsed.limit - 1);

    // Apply read filter if not 'all'
    if (parsed.read === 'read') {
      query = query.eq('read', true);
    } else if (parsed.read === 'unread') {
      query = query.eq('read', false);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Get total count
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('read', parsed.read === 'read' ? true : parsed.read === 'unread' ? false : undefined);

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('read', false);

    return NextResponse.json({
      data,
      count: count ?? 0,
      unread_count: unreadCount ?? 0,
      page: parsed.page,
      total_pages: count ? Math.ceil(count / parsed.limit) : 1,
    });
  } catch (err: any) {
    console.error('Notifications error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

// POST endpoint to mark notifications as read
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'notifications');
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    
    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { notificationIds, markAll } = markReadSchema.parse(body);

    if (!notificationIds?.length && !markAll) {
      return NextResponse.json({ 
        error: 'Either notificationIds or markAll must be provided' 
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    let query = supabase
      .from('notifications')
      .update({ 
        read: true,
        read_at: now,
        updated_at: now
      })
      .eq('user_id', session.user.id);

    // Apply filter based on provided parameters
    if (markAll) {
      // No additional filter needed, update all user's notifications
    } else if (notificationIds?.length) {
      query = query.in('id', notificationIds);
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (err: any) {
    console.error('Mark notifications error:', err);
    if (err?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}