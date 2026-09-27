import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Produces .next/standalone — a self-contained server used by the prod Docker image.
  output: "standalone",
};

export default nextConfig;
