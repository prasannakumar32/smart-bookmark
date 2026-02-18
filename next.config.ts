import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Fix cross-origin warning for network access
  allowedDevOrigins: ['192.168.110.16'],
};

export default nextConfig;
