import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
      allowedOrigins: [
        'localhost:3000', 
        '127.0.0.1:3000',
        '*.ngrok-free.app', 
        '*.ngrok-free.dev', 
        '*.ngrok.io',
        '*.ngrok.app',
        'branchlike-eli-legginged.ngrok-free.dev',
        'subgroup-unscathed-reggae.ngrok-free.dev'
      ]
    }
  },
  allowedDevOrigins: [
    'localhost:3000', 
    '127.0.0.1:3000',
    '*.ngrok-free.app', 
    '*.ngrok-free.dev', 
    '*.ngrok.io', 
    '*.ngrok.app',
    'branchlike-eli-legginged.ngrok-free.dev',
    'subgroup-unscathed-reggae.ngrok-free.dev'
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      }
    ],
  },
};

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config: NextConfig) => config;

export default withBundleAnalyzer(nextConfig);
