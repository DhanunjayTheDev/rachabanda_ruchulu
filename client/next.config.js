/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
      },
    ],
    unoptimized: true,
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
