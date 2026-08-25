#!/usr/bin/env node
/**
 * Link inventory across every route.
 *
 *   node scripts/link-audit.mjs [--base=http://localhost:3100]
 *
 * Classifies every href on every page as resolves / 404 / anchor-ok /
 * anchor-dead / external / contact, and separately lists the buttons that
 * open the consultation modal with their prefill. Writes .verify/links.json.
 */
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const BASE =
  process.argv.find((a) => a.startsWith("--base="))?.slice(7) ??
  "http://localhost:3100";

const ROUTES = [
  "/",
  "/endpoint-security",
  "/compliance-ediscovery",
  "/ai-copilot-readiness",
  "/infrastructure-networking",
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

/** id -> set of anchor targets, built once per route so we can check hashes. */
const anchorsByRoute = new Map();
const statusCache = new Map();

async function anchorsFor(route) {
  if (anchorsByRoute.has(route)) return anchorsByRoute.get(route);
  const page = await ctx.newPage();
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  const ids = await page.evaluate(() =>
    [...document.querySelectorAll("[id]")].map((el) => el.id)
  );
  await page.close();
  const set = new Set(ids);
  anchorsByRoute.set(route, set);
  return set;
}

async function statusOf(path) {
  if (statusCache.has(path)) return statusCache.get(path);
  const res = await fetch(`${BASE}${path}`, { method: "GET" });
  statusCache.set(path, res.status);
  return res.status;
}

const rows = [];
const modalButtons = [];

for (const route of ROUTES) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });

  const links = await page.evaluate(() =>
    [...document.querySelectorAll("a[href]")].map((a) => ({
      href: a.getAttribute("href"),
      text: (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 48),
      where: a.closest("header")
        ? "header"
        : a.closest("footer")
          ? "footer"
          : "body",
    }))
  );

  // Buttons that open the modal, with the prefill they carry.
  const buttons = await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .filter((b) => b.type === "button" && !b.getAttribute("aria-label"))
      .map((b) => ({
        text: (b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 48),
        where: b.closest("header") ? "header" : b.closest("footer") ? "footer" : "body",
      }))
      .filter((b) => b.text)
  );
  for (const b of buttons) modalButtons.push({ route, ...b });

  for (const link of links) {
    const href = link.href;
    let kind;
    let detail = "";

    if (/^(mailto|tel):/.test(href)) {
      kind = "contact";
    } else if (/^https?:\/\//.test(href)) {
      kind = "external";
    } else if (href === "#") {
      kind = "anchor-dead";
      detail = "placeholder href";
    } else if (href.startsWith("#")) {
      const id = href.slice(1);
      const set = await anchorsFor(route);
      kind = set.has(id) ? "anchor-ok" : "anchor-dead";
      detail = kind === "anchor-dead" ? `no #${id} on ${route}` : `#${id}`;
    } else if (href.startsWith("/")) {
      const [path, hash] = href.split("#");
      const status = await statusOf(path || "/");
      if (status !== 200) {
        kind = "404";
        detail = `status ${status}`;
      } else if (hash) {
        const set = await anchorsFor(path || "/");
        kind = set.has(hash) ? "resolves" : "anchor-dead";
        detail = kind === "resolves" ? `${path}#${hash}` : `${path} has no #${hash}`;
      } else {
        kind = "resolves";
        detail = `status ${status}`;
      }
    } else {
      kind = "unknown";
    }

    rows.push({ route, ...link, kind, detail });
  }
  await page.close();
}

await browser.close();

const order = ["404", "anchor-dead", "unknown", "anchor-ok", "resolves", "contact", "external"];
const counts = {};
for (const r of rows) counts[r.kind] = (counts[r.kind] || 0) + 1;

await writeFile(
  ".verify/links.json",
  JSON.stringify({ generatedAt: new Date().toISOString(), counts, links: rows, modalButtons }, null, 2)
);

const pad = (s, n) => String(s).padEnd(n);
console.log(`\n  LINK INVENTORY  (${rows.length} links across ${ROUTES.length} routes)\n`);
for (const kind of order) {
  const set = rows.filter((r) => r.kind === kind);
  if (!set.length) continue;
  console.log(`  ${kind.toUpperCase()}  (${set.length})`);
  const seen = new Set();
  for (const r of set) {
    const key = `${r.href}|${r.where}|${r.detail}`;
    const routes = set.filter((x) => `${x.href}|${x.where}|${x.detail}` === key).map((x) => x.route);
    if (seen.has(key)) continue;
    seen.add(key);
    const on = routes.length === ROUTES.length ? "all pages" : routes.join(", ");
    console.log(`    ${pad(r.href, 30)} ${pad(r.where, 7)} ${pad(r.text, 30)} ${pad(r.detail, 26)} on ${on}`);
  }
  console.log("");
}
console.log(`  modal-opening buttons: ${modalButtons.length}`);
const bad = rows.filter((r) => r.kind === "404" || r.kind === "anchor-dead" || r.kind === "unknown");
console.log(`  ${bad.length} broken of ${rows.length}  ->  .verify/links.json\n`);
