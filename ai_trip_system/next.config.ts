import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aitripsystem-api.onrender.com",
        port: "",
        pathname: "/api/v1/**",
      },
    ],
    domains: ['example.com'], // Thêm domain của API hình ảnh
  },
  reactStrictMode: true,
};
module.exports = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
};

export default nextConfig;
