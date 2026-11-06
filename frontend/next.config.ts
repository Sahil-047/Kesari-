import type { NextConfig } from "next";

type RemotePattern = {
  protocol?: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
};

/** Allow next/image to load CMS media through the API /img proxy. */
function imgRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [
    { protocol: "http", hostname: "localhost", port: "4000", pathname: "/img/**" },
    { protocol: "http", hostname: "127.0.0.1", port: "4000", pathname: "/img/**" },
  ];

  const api = process.env.NEXT_PUBLIC_API_URL;
  if (api) {
    try {
      const url = new URL(api);
      // API is …/api; media lives on the same origin at /img/…
      patterns.push({
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: "/img/**",
      });
    } catch {
      // ignore malformed env
    }
  }

  return patterns;
}

const apiHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname : "localhost";
  } catch {
    return "localhost";
  }
})();

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    qualities: [75, 95, 100],
    // Next 16 blocks optimizer fetches to private IPs (localhost API /img) unless allowed.
    dangerouslyAllowLocalIP: apiHost === "localhost" || apiHost === "127.0.0.1",
    remotePatterns: imgRemotePatterns(),
  },
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
