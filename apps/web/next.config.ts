import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

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
