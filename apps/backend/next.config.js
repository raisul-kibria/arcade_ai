/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Remove deprecated experimental.appDir option
  swcMinify: false, // Disable SWC minification to avoid binary loading issues
  compiler: {
    // Use alternative compilation method
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig