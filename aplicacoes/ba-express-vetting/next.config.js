/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api/v1';

const nextConfig = {
  reactStrictMode: true,
  compress: true,

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

  // Headers for security
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // CORS configuration
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/:path*`,
        }
      ]
    }
  },

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
