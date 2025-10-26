'use client';

import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Add any global providers here when needed (e.g., theme, query, etc.)
  return <>{children}</>;
}