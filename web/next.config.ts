import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Static export
  distDir: process.env.APP_ENV === 'prod' ? './web-build/prod' : './web-build/dev',
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
