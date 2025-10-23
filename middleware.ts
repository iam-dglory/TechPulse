// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseServer } from './lib/supabase/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // protect /dashboard and /admin
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    const supabase = createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
