import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/en', destination: '/' },
      { source: '/zh', destination: '/' },
      { source: '/en/:path*', destination: '/:path*' },
      { source: '/zh/:path*', destination: '/:path*' },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
      { protocol: 'https', hostname: 'fal.media' },
    ],
  },
};

export default nextConfig;
