/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure server components can bundle prisma or firebase-admin cleanly
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma', 'firebase-admin'],
  },
};

export default nextConfig;
