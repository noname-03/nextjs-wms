import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Disable development indicators
  devIndicators: false,
  // Disable ESLint during build to avoid deployment errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Uncomment untuk static export (shared hosting)
  // output: 'export',
  // trailingSlash: true,
  // images: {
  //   unoptimized: true
  // }
};

export default nextConfig;
