import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/simple",
        destination: "http://localhost:8000/api/simple", // Proxy rediredect to FastAPI only for this route
      },
    ];
  },
};

export default nextConfig;
