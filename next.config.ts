import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@shelby-protocol/sdk"],
  },
};

export default nextConfig;