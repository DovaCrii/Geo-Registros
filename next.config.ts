import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  outputFileTracingRoot: path.resolve(__dirname),

  // ── Package optimizations ──────────────────────────────────
  experimental: {
    optimizePackageImports: [
      "maplibre-gl",
      "@watergis/maplibre-gl-terradraw",
      "lucide-react",
    ],
  },

  // ── Image optimization ─────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "server.arcgisonline.com",
        pathname: "/ArcGIS/rest/services/**",
      },
      {
        protocol: "https",
        hostname: "*.tile.openstreetmap.org",
        pathname: "/**",
      },
    ],
  },

  // ── Server-only packages (never bundled for client) ────────
  serverExternalPackages: ["bcryptjs"],

  // ── Compilation ────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
