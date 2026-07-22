/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api/v1';

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  output: 'export',

  // Allow images from baexpress.co.uk
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'baexpress.co.uk' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
  },

  // Note: headers and rewrites not supported with static export (output: 'export')

  // Webpack configuration
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
    };

    return config;
  },

  // Performance optimizations
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
