import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', //
  images: {
    unoptimized: true, //
  },
  // If you are using trailing slashes for cleaner URLs
  trailingSlash: true, 
};

export default nextConfig;