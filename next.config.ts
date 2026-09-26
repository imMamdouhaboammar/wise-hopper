import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  serverExternalPackages: ['react-dom/server'],
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.resolve(process.env.HOME || path.resolve(__dirname, '../../..')),
  rewrites: async () => [
    {
      source: '/content/:slug.md',
      destination: '/api/content/:slug?format=md',
    },
    {
      source: '/content/:slug.txt',
      destination: '/api/content/:slug?format=txt',
    },
  ],
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
    {
      source: '/content/:slug*.md',
      headers: [
        {
          key: 'X-Robots-Tag',
          value: 'noindex, follow',
        },
        {
          key: 'Content-Type',
          value: 'text/markdown; charset=utf-8',
        },
      ],
    },
    {
      source: '/content/:slug*.txt',
      headers: [
        {
          key: 'X-Robots-Tag',
          value: 'noindex, follow',
        },
        {
          key: 'Content-Type',
          value: 'text/plain; charset=utf-8',
        },
      ],
    },
  ],
};

export default nextConfig;
