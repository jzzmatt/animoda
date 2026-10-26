import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["openai"],
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;
