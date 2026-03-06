/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rosteriq/shared-types'],
  output: 'standalone',
};

module.exports = nextConfig;
