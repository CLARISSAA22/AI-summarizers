import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['youtube-dl-exec'],
  // Increase timeout for AI generation (max is 60s on Hobby for some versions, or 10s)
  // Note: Only effective on Pro/Enterprise or when using specific Vercel settings.
  // We'll also try to optimize the code.
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
