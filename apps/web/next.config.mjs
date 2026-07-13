/** @type {import('next').NextConfig} */

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const basePath = isGithubActions ? '/vibe-coding-hackathon' : '';

const nextConfig = {
  // Use static export only for GitHub Actions (GitHub Pages deployment).
  // Vercel and Docker use standard Next.js output.
  ...(isGithubActions && {
    output: 'export',
    basePath,
    assetPrefix: basePath,
    images: { unoptimized: true },
  }),
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  transpilePackages: ['@ksp/contracts'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
