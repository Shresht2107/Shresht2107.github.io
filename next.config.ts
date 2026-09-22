import type { NextConfig } from 'next';

/**
 * Static export for GitHub Pages.
 *
 * The site is served from the root of Shresht2107.github.io, so no basePath /
 * assetPrefix is needed. If this ever moves to a project repo (e.g. /portfolio),
 * set basePath and assetPrefix to '/portfolio' and route every hardcoded public
 * path through `withBasePath()` in lib/base-path.ts.
 */
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
