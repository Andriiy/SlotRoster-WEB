import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Remove experimental features that might cause issues
  // experimental: {
  //   ppr: true,
  //   clientSegmentCache: true,
  //   nodeMiddleware: true
  // }
};

export default nextConfig;
