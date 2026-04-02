import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // pixel art should not be optimized/blurred
  },
};

export default nextConfig;
