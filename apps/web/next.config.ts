import type { NextConfig } from "next";

// Note: next-pwa doesn't natively support ES Modules well without require, 
// but since this is TS we can import it.
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev to avoid caching issues
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  transpilePackages: ["@jeevan-ai/ui", "@jeevan-ai/types"],
  // Vercel breaks if output is set to "standalone" because it handles output tracing automatically.
  // We only need "standalone" for our custom Docker build.
  output: process.env.VERCEL ? undefined : "standalone",
  turbopack: {},
};

export default withPWA(nextConfig);
