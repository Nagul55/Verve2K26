import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.ngrok-free.dev', 'branchlike-eli-legginged.ngrok-free.dev']
    }
  }
};

export default nextConfig;
