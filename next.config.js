/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com', 'res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: true,
  },
  // Optimize for edge runtime where possible
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@supabase/supabase-js'],
  },
  // Optimize bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Cache static assets
  staticPageGenerationTimeout: 120,
  // Optimize for Vercel deployment
  poweredByHeader: false,
}

module.exports = nextConfig