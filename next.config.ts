import type { NextConfig } from "next";

const nextConfig: any = {
  serverExternalPackages: [],
  serverActions: {
    allowedOrigins: ['localhost:3000', '*.ngrok-free.dev', 'branchlike-eli-legginged.ngrok-free.dev']
  },
  allowedDevOrigins: ['branchlike-eli-legginged.ngrok-free.dev', '*.ngrok-free.dev']
};

export default nextConfig;
