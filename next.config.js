/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Disable static optimization for pages with errors
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Skip type checking during build to identify runtime errors
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
