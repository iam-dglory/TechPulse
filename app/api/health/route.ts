// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const uptime = process.uptime();
  return NextResponse.json({
    status: 'ok',
    time: new Date().toISOString(),
    uptime_seconds: Math.round(uptime),
  });
}
