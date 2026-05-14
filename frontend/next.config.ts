import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker deployment (standalone output)
  output: "standalone",

  // Allow Supabase Storage images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
