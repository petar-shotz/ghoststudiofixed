import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "**.run.app",
    "**.cloudworkstations.dev",
    "**.web.app",
    "**.firebaseapp.com",
    "**.hosted.app",
  ],
};

export default nextConfig;
