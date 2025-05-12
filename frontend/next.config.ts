import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👇 ESLintエラーがあってもVercelでのbuildを止めない
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;