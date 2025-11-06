/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // {
      //   protocol: 'https',
      //   hostname: 'food-cms.grab.com',
      //   port: '',
      //   pathname: '/compressed_webp/merchants/**',
      // },
      // {
      //   protocol: 'https',
      //   hostname: 'firebasestorage.googleapis.com',
      // },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
}

export default nextConfig
