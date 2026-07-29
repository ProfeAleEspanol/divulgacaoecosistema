import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? "/divulgacaoecosistema" : undefined,
  assetPrefix: isGitHubPages ? "/divulgacaoecosistema/" : undefined,
  trailingSlash: isGitHubPages,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: isGitHubPages,
  },
};

export default nextConfig;
