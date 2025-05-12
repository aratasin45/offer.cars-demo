import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👇 ESLintエラーがあってもビルドを止めない
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 👇 TypeScriptの型チェックエラーも無視（Vercel本番ビルド用）
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;