import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-7c7d70c5ee754c9e86dee2a6f4161b06.r2.dev",
      },
    ],
  },
};

export default nextConfig;
