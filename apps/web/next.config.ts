import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Transpile workspace packages so Next.js compiles their TypeScript source.
   * Required for pnpm workspace packages that ship TypeScript source (no pre-compilation).
   */
  transpilePackages: [
    '@rashx/tokens',
    '@rashx/i18n',
    '@rashx/icons',
    '@rashx/ui',
    '@rashx/content',
    '@rashx/seo',
  ],

  typedRoutes: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },

  // Headers for security
  async headers() {
    return [
      {
        // Internal brand review pages: keep out of the index (header is seen even without HTML)
        source: '/brand/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
