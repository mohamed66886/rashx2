import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@rashx/tokens',
    '@rashx/ui',
    '@rashx/icons',
    '@rashx/i18n',
  ],
};

export default nextConfig;

