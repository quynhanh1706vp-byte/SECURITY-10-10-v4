// next.config.js
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const baseConfig = {
  transpilePackages: ['@refinedev/antd'],
  output: 'standalone',
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['@refinedev/antd', 'antd', '@ant-design/icons', '@ant-design/charts'],
  },
  compress: true,
  optimizeFonts: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'development'
      ? false  // Giữ tất cả console trong dev
      : {
          exclude: ['error'],  // Production: chỉ giữ console.error
        },
  },
};

export default withNextIntl(baseConfig);
