import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// The dev server only trusts localhost. Opening the Network URL (a LAN IP)
// otherwise blocks the dev socket, so the page never hydrates and animations stay frozen.
function lanDevOrigins(): string[] {
  const origins = new Set<string>();
  for (const entries of Object.values(networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.internal || entry.family !== "IPv4") continue;
      origins.add(entry.address);
    }
  }
  return [...origins];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: lanDevOrigins(),
  cacheComponents: true,
  partialPrefetching: true,
  // Photos are served as-is; sharp isn't installed (see pnpm-workspace.yaml).
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
