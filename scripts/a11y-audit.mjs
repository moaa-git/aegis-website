#!/usr/bin/env node
/**
 * Accessibility audit: colour contrast, plus pointer affordance on controls.
 *
 *   node scripts/a11y-audit.mjs [--base=http://localhost:3100]
 *
 * Three passes, because one is not enough on this site:
 *
 * 1. DOM sweep. Every element that owns a text node, on every route at two
 *    viewports. The real background is composited from the ancestor stack,
 *    and the ratio is checked against 4.5:1 (3:1 for large text).
 *
 *    Colours are resolved by painting them to a 1x1 canvas and reading the
 *    pixel back, NOT by parsing the string. Tailwind v4 emits color-mix(),
 *    which computes to `oklab(... / 0.9)`; an rgba() regex silently skips
 *    every muted style on the site and reports a clean run having measured
 *    none of them.
 *
 * 2. CTA pass. A gradient element's backgroundColor is `transparent`, so the
 *    DOM sweep scores its text against whatever is behind the button. These
 *    controls are measured from pixels instead: hide the glyphs, screenshot
 *    the control, and take the lightest pixel *within the band the text
 *    occupies*. The band matters — a button's 1px top edge highlight is the
 *    lightest thing in it and is not what the glyphs sit on.
 *
 * 3. Cursor pass. Every button, link and summary must compute to
 *    `cursor: pointer`. Tailwind v4's Preflight leaves <button> on the UA
 *    default, so a button reads as unclickable unless the base layer puts it
 *    back — see globals.css.
 *
 * Exits non-zero if anything fails, so it can gate CI.
 */
import { chromium } from "playwright";
import sharp from "sharp";

const BASE =
  process.argv.find((x) => x.startsWith("--base="))?.slice(7) ??
  "http://localhost:3100";

const ROUTES = [
  "/", "/endpoint-security", "/compliance-ediscovery", "/ai-copilot-readiness",
  "/infrastructure-networking", "/our-story", "/methodology", "/faq",
  "/privacy", "/terms",
];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const TARGETS = [
  ["/", 'header button', "nav CTA"],
  ["/", 'a[href="#packages"]', "hero primary CTA"],
  ["/methodology", '[data-verify="methodology-cta"] button', "methodology CTA"],
  ["/our-story", '[data-verify="story-cta"] button', "story CTA"],
  ["/", 'span:text-is("Most Popular")', "Most Popular ribbon"],
  ["/endpoint-security", 'a:text-is("View Service Packages")', "pillar page hero CTA"],
  ["/faq", 'a:text-is("View Service Packages")', "faq hero CTA"],
  ["/", '[data-verify="pricing"] button', "pricing popular CTA"],
];


const AUDIT = () => {
  // Resolve colours through a canvas rather than by regex: Tailwind v4 emits
  // color-mix(), which computes to oklab(... / a). A regex for rgba() skips
  // every muted style on the site without erroring.
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  const rgba = (str) => {
    if (!str || str === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
    ctx.clearRect(0, 0, 1, 1);
    try { ctx.fillStyle = str; } catch { return null; }
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
  };
  const over = (s, d) => ({
    r: s.r * s.a + d.r * (1 - s.a),
    g: s.g * s.a + d.g * (1 - s.a),
    b: s.b * s.a + d.b * (1 - s.a),
    a: 1,
  });
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  const bgOf = (el) => {
    const stack = [];
    let n = el;
    while (n && n.nodeType === 1) {
      const bg = rgba(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0) { stack.push(bg); if (bg.a === 1) break; }
      n = n.parentElement;
    }
    let out = { r: 15, g: 23, b: 42, a: 1 }; // --color-surface, the page ground
    for (let i = stack.length - 1; i >= 0; i--) out = over(stack[i], out);
    return out;
  };

  const rows = [];
  for (const el of document.querySelectorAll("*")) {
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3 && n.textContent.trim())
      .map((n) => n.textContent.trim()).join(" ");
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) continue;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const fg0 = rgba(cs.color);
    if (!fg0 || fg0.a === 0) continue;
    const bg = bgOf(el);
    const fg = over(fg0, bg);
    const cr = ratio(fg, bg);
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = px >= 24 || (px >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    rows.push({
      cr: +cr.toFixed(2), need, pass: cr >= need,
      color: cs.color.replace(/oklab\([^)]*\/\s*([\d.]+)\)/, "white/$1").replace(/oklab\([^)]*\)/, "white"),
      alpha: +fg0.a.toFixed(2), px, weight: cs.fontWeight,
      bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
      sample: own.slice(0, 40),
      cls: (typeof el.className === "string" ? el.className : "").slice(0, 64),
    });
  }
  return rows;
};


const srgbLum = (r, g, b) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const browser = await chromium.launch();
let failures = 0;

// ---------------------------------------------------------------- pass 1
const all = [];
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const rows = await page.evaluate(AUDIT);
    all.push(...rows.map((x) => ({ ...x, route, vp: vp.name })));
  }
  await ctx.close();
}

const uniq = new Map();
for (const x of all) {
  const k = `${x.color}|${x.bg}|${x.px}|${x.weight}`;
  if (!uniq.has(k)) uniq.set(k, { ...x, routes: new Set() });
  uniq.get(k).routes.add(x.route);
}
const list = [...uniq.values()].sort((a, b) => a.cr - b.cr);

console.log("\n  DOM SWEEP\n");
console.log("   ratio  need  res   fg               bg                 size/wt   sample");
console.log("  " + "-".repeat(100));
for (const x of list) {
  console.log(
    `  ${String(x.cr).padStart(6)}  ${String(x.need).padEnd(4)}  ${x.pass ? "PASS" : "FAIL"}  ` +
      `${x.color.padEnd(16)} ${x.bg.padEnd(18)} ${String(x.px).padStart(4)}px/${x.weight}  "${x.sample.slice(0, 26)}"`
  );
}
for (const f of list.filter((x) => !x.pass)) {
  failures++;
  console.log(`\n  FAIL ${f.cr}:1 (needs ${f.need}) — ${f.color} on ${f.bg} @ ${f.px}px/${f.weight}`);
  console.log(`       "${f.sample}"  [${[...f.routes].join(", ")}]`);
}

// ---------------------------------------------------------------- pass 2
console.log("\n  CTA PASS (background under the glyph band, text hidden)\n");
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
for (const [route, sel, label] of TARGETS) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const el = page.locator(sel).first();
  if (!(await el.count())) { console.log(`  (not found) ${label}`); continue; }
  await el.scrollIntoViewIfNeeded();

  const band = await el.evaluate((node) => {
    const r = node.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(node);
    const t = range.getBoundingClientRect();
    return { top: (t.top - r.top) / r.height, bottom: (t.bottom - r.top) / r.height };
  });

  await page.addStyleTag({ content: "*{color:transparent !important;text-shadow:none !important}" });
  await page.waitForTimeout(120);
  const shot = await el.screenshot();
  const { data, info } = await sharp(shot).raw().toBuffer({ resolveWithObject: true });

  const y0 = Math.max(0, Math.floor(band.top * info.height));
  const y1 = Math.min(info.height, Math.ceil(band.bottom * info.height));
  let bestL = -1, best = null;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const L = srgbLum(data[i], data[i + 1], data[i + 2]);
      if (L > bestL) { bestL = L; best = [data[i], data[i + 1], data[i + 2]]; }
    }
  }
  const ratio = 1.05 / (bestL + 0.05);
  const pass = ratio >= 4.5;
  if (!pass) failures++;
  console.log(
    `  ${ratio.toFixed(2).padStart(6)}:1  ${pass ? "PASS" : "FAIL"}  rgb(${best.join(",")})  — ${label}`
  );
}

// ---------------------------------------------------------------- pass 3
console.log("\n  CURSOR PASS (every control must be cursor:pointer)\n");
{
  const cp = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const route of ROUTES) {
    await cp.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    const bad = await cp.evaluate(() =>
      [...document.querySelectorAll("button, a[href], summary")]
        .filter((el) => el.getBoundingClientRect().width && getComputedStyle(el).cursor !== "pointer")
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          cursor: getComputedStyle(el).cursor,
          text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30) || "(icon)",
        }))
    );
    console.log(`  ${route.padEnd(28)} ${bad.length === 0 ? "PASS" : `FAIL — ${bad.length}`}`);
    for (const x of bad) {
      failures++;
      console.log(`      ${x.tag} "${x.text}" -> ${x.cursor}`);
    }
  }
  await cp.close();
}

await browser.close();
console.log(`\n  ${list.length} distinct text styles + ${TARGETS.length} CTAs + cursors on ${ROUTES.length} routes`);
console.log(`  ${failures} failure(s)\n`);
process.exit(failures ? 1 : 0);
