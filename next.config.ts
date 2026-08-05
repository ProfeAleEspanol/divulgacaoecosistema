import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const isServerBuild = process.env.SERVER_BUILD === "true";
const isStaticExport = !isServerBuild;

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  basePath: isGitHubPages ? "/divulgacaoecosistema" : undefined,
  assetPrefix: isGitHubPages ? "/divulgacaoecosistema/" : undefined,
  trailingSlash: isGitHubPages,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: isStaticExport,
  },
};

export default nextConfig;
