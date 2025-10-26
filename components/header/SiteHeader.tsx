'use client';

import Link from 'next/link';
import { NotificationBell } from './NotificationBell';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="inline-block w-6 h-6">⚡</span>
          <span>TechPulze</span>
        </Link>
        <div className="flex items-center gap-4">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}