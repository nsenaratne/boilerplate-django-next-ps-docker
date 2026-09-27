import type { NextConfig } from "next";

// In development the browser calls the API on the frontend's own origin (/api/v1/...) and
// Next.js forwards it to Django inside Docker. Production does the same thing with nginx,
// so both environments are same-origin: no CORS, and the session cookie just works.
// Unset in the production build, where nginx owns /api/.
const apiProxyTarget = process.env.API_PROXY_TARGET;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Produces .next/standalone — a self-contained server used by the prod Docker image.
  output: "standalone",
  // Django URLs end in "/"; don't let Next.js redirect them to the slash-less form.
  skipTrailingSlashRedirect: true,
  // The e2e container opens the dev server as http://frontend:3000. Next.js blocks dev-only
  // resources (and so hydration) for hostnames that aren't allowed here.
  allowedDevOrigins: ["frontend"],
  async rewrites() {
    if (!apiProxyTarget) return [];
    return [
      { source: "/api/:path*/", destination: `${apiProxyTarget}/api/:path*/` },
      { source: "/api/:path*", destination: `${apiProxyTarget}/api/:path*` },
    ];
  },
};

export default nextConfig;
