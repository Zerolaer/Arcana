/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  // Ensure CSS is properly processed for static export
  compiler: {
    removeConsole: false,
  },
  // Disable image optimization for static export
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Disable caching for development
  generateEtags: false,
  poweredByHeader: false,
}

module.exports = nextConfig
