/**
 * Turnstile key selection. Client-safe: only the public sitekey is resolved
 * here. The secret is resolved in the route handler, which is the only place
 * that needs it.
 *
 * One widget is configured in Cloudflare (`aegisascent-lead-form`, hostname
 * `aegisascent.com`). Rather than loosen that widget's allowed domains so
 * localhost and deploy previews can use it, non-production contexts use
 * Cloudflare's public dummy pair. The production widget config is never
 * relaxed, and the "unknown domain" (110200) failure on localhost goes away.
 */

/** Cloudflare's documented test keys. */
export const TURNSTILE_TEST_KEYS = {
  /** Always passes. */
  pass: {
    sitekey: "1x00000000000000000000AA",
    secret: "1x0000000000000000000000000000000AA",
  },
  /** Always blocks — set TURNSTILE_TEST_MODE=fail to exercise the reject path. */
  fail: {
    sitekey: "2x00000000000000000000AB",
    secret: "2x0000000000000000000000000000000AA",
  },
} as const;

/** The `action` reported back by siteverify, recorded in submission metadata. */
export const TURNSTILE_ACTION = "consultation";

/**
 * True only in a production deploy. Set `NEXT_PUBLIC_CONTEXT=$CONTEXT` in the
 * build environment — the value must be inlined at build time to reach the
 * browser, so the host's own `CONTEXT` is not enough on its own.
 *
 * Defaults to false. A missing variable therefore renders the dummy widget
 * rather than silently shipping an unverified form, which is the failure the
 * launch check looks for.
 */
export const isProductionContext =
  process.env.NEXT_PUBLIC_CONTEXT === "production";

const testMode =
  process.env.NEXT_PUBLIC_TURNSTILE_TEST_MODE === "fail" ? "fail" : "pass";

/** The sitekey this build should render. */
export const turnstileSiteKey = isProductionContext
  ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""
  : TURNSTILE_TEST_KEYS[testMode].sitekey;
