import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['cdn.administrace.tv'],
    // nebo použijte remotePatterns pro větší flexibilitu
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // povolí všechny domény
      },
    ],
  },
};

export default nextConfig;