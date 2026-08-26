import type { NextConfig } from "next";

/**
 * The production hostnames. Anything else serving this app — the *.vercel.app
 * deployment URLs, any future preview host, localhost — is a copy of the real
 * site and must not be indexed, or it competes with aegisascent.com for its
 * own content.
 */
const PRODUCTION_HOST = "(www\\.)?aegisascent\\.com";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        // `missing` inverts the match: the header is attached on every host
        // EXCEPT the production one. Written this way round deliberately —
        // a rule that named the vercel.app host instead would silently stop
        // covering the next preview domain, and this one needs no edit at
        // cutover: it disengages the moment the site answers on its own
        // domain.
        missing: [{ type: "host", value: PRODUCTION_HOST }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
