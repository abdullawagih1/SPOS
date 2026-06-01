import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Increase header size limit for large Supabase session cookies
  httpAgentOptions: {
    keepAlive: true,
  },
};

export default nextConfig;
