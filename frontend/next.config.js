/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // This allows production builds to successfully complete even if
    // your project has type errors or flag mismatches on Render.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;