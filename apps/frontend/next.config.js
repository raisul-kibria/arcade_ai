/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@arcade-ai/games'],
  images: {
    domains: ['images.pexels.com'],
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Remove deprecated experimental.appDir option
  // App directory is now stable in Next.js 14
  swcMinify: false, // Disable SWC minification to avoid binary loading issues
  compiler: {
    // Use alternative compilation method
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side configuration for Phaser
      config.resolve.fallback = {
        fs: false,
        path: false,
      }
    }
    
    // Ensure Phaser is only loaded on the client side
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('phaser')
    }
    
    return config
  },
}

module.exports = nextConfig