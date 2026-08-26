#!/usr/bin/env node
/**
 * Anchor and outbound-link check for /privacy and /terms.
 *
 *   node scripts/legal-anchors.mjs [--base=http://localhost:3100] [--offline]
 *
 * scripts/link-audit.mjs proves an href has a matching id somewhere on the
 * page. This proves the stronger thing the Termly documents actually need:
 * that following a table-of-contents fragment *lands on the right heading*,
 * with the heading visible rather than parked under the top of the window.
 *
 * Outbound links (Termly's DSAR form, Cloudflare's policies, the AAA) are
 * requested once each; --offline skips that half.
 */
import { chromium } from "playwright";

const arg = (k, d) =>
  process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d;
const BASE = arg("base", "http://localhost:3100").replace(/\/$/, "");
const OFFLINE = process.argv.includes("--offline");
const ROUTES = ["/privacy", "/terms"];

/** A heading must land within this many px of the top of the viewport. */
const LANDING_TOLERANCE = 48;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const failures = [];
const external = new Map();
let anchorsChecked = 0;

for (const route of ROUTES) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  // Smooth scrolling would have every measurement land mid-animation.
  await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });

  const links = await page.evaluate(() =>
    [...document.querySelectorAll("[data-verify='legal-body'] a[href]")].map((a) => ({
      href: a.getAttribute("href"),
      text: (a.textContent || "").trim().replace(/\s+/g, " "),
    }))
  );

  for (const link of links) {
    if (/^https?:/.test(link.href)) {
      external.set(link.href, (external.get(link.href) || 0) + 1);
      continue;
    }
    if (!link.href.startsWith("#")) continue;
    const id = link.href.slice(1);
    anchorsChecked++;

    const landed = await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return { found: false };
      location.hash = "";
      location.hash = id;
      const r = el.getBoundingClientRect();
      return {
        found: true,
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").trim().replace(/\s+/g, " "),
        top: Math.round(r.top),
        // The last section cannot be scrolled to the top of the window --
        // there is not a viewport of document left below it. At the end of
        // the scroll range the requirement is only that the heading is on
        // screen, which is the most the browser can do.
        atDocumentEnd:
          window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 2,
        viewportHeight: window.innerHeight,
      };
    }, id);

    if (!landed.found) {
      failures.push(`${route} #${id}: no element with that id`);
      continue;
    }
    if (!/^h[1-6]$/.test(landed.tag)) {
      failures.push(`${route} #${id}: target is <${landed.tag}>, not a heading`);
    }
    const ceiling = landed.atDocumentEnd
      ? landed.viewportHeight - 40
      : LANDING_TOLERANCE;
    if (landed.top < 0 || landed.top > ceiling) {
      failures.push(
        `${route} #${id}: heading landed ${landed.top}px from the top ` +
          `(expected 0-${ceiling}${landed.atDocumentEnd ? ", at end of scroll" : ""})`
      );
    }
    // A table-of-contents entry repeats its section's heading verbatim, so
    // a mis-paired fragment is caught here rather than by eye. Prose
    // cross-references ("your privacy rights") legitimately read differently
    // from the heading they point at and are not held to this.
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (/^\d+\.\s/.test(link.text) && norm(landed.text) !== norm(link.text)) {
      failures.push(
        `${route} #${id}: TOC entry "${link.text}" landed on "${landed.text}"`
      );
    }
  }
  await page.close();
}

await browser.close();

// ---- outbound links ------------------------------------------------------
const externalResults = [];
if (!OFFLINE) {
  for (const [url, count] of external) {
    try {
      const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
      externalResults.push({ url, count, status: res.status });
      if (res.status >= 400) failures.push(`${url}: status ${res.status}`);
    } catch (e) {
      externalResults.push({ url, count, status: `error: ${e.message}` });
      failures.push(`${url}: ${e.message}`);
    }
  }
}

const pad = (s, n) => String(s).padEnd(n);
console.log(`\n  ANCHOR LANDINGS  (${anchorsChecked} in-document fragments across ${ROUTES.length} routes)`);
console.log(`  all landed on their heading within ${LANDING_TOLERANCE}px of the top: ${
  failures.filter((f) => f.includes("#")).length === 0 ? "yes" : "NO"
}`);
if (externalResults.length) {
  console.log(`\n  OUTBOUND LINKS`);
  for (const r of externalResults) {
    console.log(`    ${pad(r.status, 8)} x${pad(r.count, 3)} ${r.url}`);
  }
}
if (failures.length) {
  console.log(`\n  FAILURES`);
  for (const f of failures) console.log(`    ${f}`);
}
console.log(`\n  ${failures.length} failure(s)\n`);
process.exit(failures.length ? 1 : 0);
