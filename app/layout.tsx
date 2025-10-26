import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/header/SiteHeader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'TechPulze - Know Which Tech Companies You Can Trust',
    template: '%s | TechPulze'
  },
  description: 'AI-Powered Ethics Ratings, Real-Time Updates, and Community-Driven Transparency for tech companies worldwide.',
  keywords: ['tech ethics', 'company ratings', 'transparency', 'AI ethics', 'credibility score'],
  authors: [{ name: 'TechPulze Team' }],
  creator: 'TechPulze',
  publisher: 'TechPulze',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://techpulze.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TechPulze - Tech Company Ethics Ratings',
    description: 'Discover trustworthy tech companies through comprehensive ethics ratings and community reviews.',
    url: 'https://techpulze.vercel.app',
    siteName: 'TechPulze',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TechPulze - Tech Company Ethics Ratings',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechPulze - Tech Company Ethics Ratings',
    description: 'Discover trustworthy tech companies through comprehensive ethics ratings and community reviews.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-192x192.svg', type: 'image/svg+xml', sizes: '192x192' },
      { url: '/favicon-512x512.svg', type: 'image/svg+xml', sizes: '512x512' },
    ],
    apple: [
      { url: '/favicon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
        color: '#3b82f6',
      },
    ],
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <SiteHeader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}