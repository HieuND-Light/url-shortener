import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/home',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
