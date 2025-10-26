// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    const startTime = Date.now();
    const uptime = process.uptime();
    const supabase = createSupabaseServer();
    
    // Check database connection
    const { error } = await supabase.from('companies').select('id').limit(1);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'ok',
      uptime: Math.round(uptime),
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: error ? 'unhealthy' : 'healthy',
        api: 'healthy'
      },
      performance: {
        response_time_ms: responseTime
      }
    });
  } catch (err: any) {
    console.error('Health check error:', err);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: err.message || 'Unknown error'
    }, { status: 500 });
  }
}
