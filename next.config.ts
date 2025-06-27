import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // nebo použijte remotePatterns pro větší flexibilita
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // povolí všechny domény
      },
    ],
  },
};

export default nextConfig;