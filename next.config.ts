import type { NextConfig } from "next";

// Set NEXT_BASE_PATH=/tool-loan when building for GitHub Pages (done in the
// deploy workflow). Left unset locally so `npm run dev`/`npm run build` serve from `/`.
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath,
  trailingSlash: true,
};

export default nextConfig;
