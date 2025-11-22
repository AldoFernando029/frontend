import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Tanda ** artinya BOLEH ambil gambar dari website MANA SAJA
      },
    ],
  },
};

export default nextConfig;