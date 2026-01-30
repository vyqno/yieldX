import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // CORS headers for public API
  async headers() {
    return [
      {
        // Apply CORS to all API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Allow all origins for public API
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With, X-RateLimit-*",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400", // 24 hours
          },
          {
            key: "Access-Control-Expose-Headers",
            value: "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
