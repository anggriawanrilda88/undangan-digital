import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker deployment (standalone output)
  output: "standalone",

  // Allow external images (MinIO + future CDN)
  images: {
    remotePatterns: [
      {
        // MinIO self-hosted
        protocol: "https",
        hostname: "minio.anggriawan.my.id",
      },
      {
        // MinIO storage subdomain
        protocol: "https",
        hostname: "storage-undangan-digital.anggriawan.my.id",
      },
      {
        // API backend uploads
        protocol: "https",
        hostname: "api-undangan-digital.anggriawan.my.id",
      },
    ],
    // Allow SVG as images
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
};

export default nextConfig;
