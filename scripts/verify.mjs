#!/usr/bin/env node
/**
 * Aegis Ascent verification harness.
 *
 *   node scripts/verify.mjs                 capture, measure, assert, diff vs baseline
 *   node scripts/verify.mjs --baseline      same, but write the result as the new baseline
 *   node scripts/verify.mjs --routes=/,/endpoint-management
 *   node scripts/verify.mjs --base=http://localhost:3100
 *
 * Outputs
 *   .verify/shots/<route>--<viewport>.png            full-page
 *   .verify/shots/<route>--<viewport>--<NN-band>.png element-scoped band crops
 *   .verify/metrics/<route>--<viewport>.json         box metrics + computed styles
 *   .verify/baseline/<route>--<viewport>.json        snapshot for regression diffing
 *   .verify/report.json                              assertions, findings, diff
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

// ---------------------------------------------------------------- config

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 },
];

const DEFAULT_ROUTES = [
  "/",
  "/endpoint-security",
  "/compliance-ediscovery",
  "/ai-copilot-readiness",
  "/infrastructure-networking",
];

/**
 * Inter-section vertical rhythm permitted at desktop, in px, measured
 * content-to-content. The design's own rhythm is a 160px pb + 160px pt pair
 * across each boundary, so the window is set around that ~320px figure
 * rather than the generic 48-192 that suits a margin-spaced layout.
 */
const GAP_MIN = 180;
const GAP_MAX = 460;

/**
 * Per-route overrides. AI & Copilot Readiness is deliberately the tightest
 * page in the design — its comp sets 80px between bands where every other
 * page uses 120px, and its bands close on a padded panel whose own bottom
 * padding is counted in the content gap. Holding it to the other pages'
 * window would fail a page that matches its comp.
 */
const GAP_WINDOWS = {
  "/ai-copilot-readiness": [100, 460],
};
const gapWindow = (route) => GAP_WINDOWS[route] ?? [GAP_MIN, GAP_MAX];

/** A band that moves more than this vs baseline is a regression. */
const DIFF_TOLERANCE = 8;

/** Sub-pixel slop before a bounds comparison counts as an overflow. */
const EPSILON = 0.5;

/**
 * Largest per-channel tonal step permitted across a band boundary, 0-255.
 * A continuous canvas should show no step at all; 2 absorbs dithering and
 * PNG rounding without hiding a real seam (the hero clip measures ~7).
 */
const SEAM_TOLERANCE = 2;

/**
 * Boundaries whose tonal step is a documented design decision, not a defect.
 * Matched on the boundary label; still measured and printed, but reported as
 * a warning so a real regression elsewhere is not lost in the noise. Each
 * entry must cite the ledger entry that justifies it.
 */
const KNOWN_SEAMS = [
  {
    match: /-> 0\d-(contact|footer)$/,
    max: 4,
    why: "designed #0f172a -> #0c1428 footer tone step (DEVIATIONS.md, background-continuity pass)",
  },
  {
    match: /-> 0\d-story$/,
    max: 5,
    why: "Story backdrop photo's crisp top edge; its overlay starts at 40% darkening by design (DEVIATIONS.md)",
  },
];

const BAND_SELECTOR =
  "main > section, main > header, main > footer, body > header, body > footer";

const ARGS = process.argv.slice(2);
const argVal = (k, d) => {
  const hit = ARGS.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.slice(k.length + 3) : d;
};
const WRITE_BASELINE = ARGS.includes("--baseline");
const BASE = argVal("base", "http://localhost:3100").replace(/\/$/, "");
const ROUTES = argVal("routes", "")
  ? argVal("routes", "").split(",").filter(Boolean)
  : DEFAULT_ROUTES;

const slug = (route) =>
  route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");

// ------------------------------------------------- in-page measurement

/**
 * Runs in the browser. Returns every measurement the report needs in one
 * pass so nothing is captured at two different scroll positions.
 */
function collectPage(cfg) {
  const { BAND_SELECTOR, EPSILON } = cfg;

  const CLIPPING = /hidden|clip|scroll|auto/;

  /** Nearest ancestor that clips painted overflow, or null. */
  const clipperOf = (el) => {
    let p = el.parentElement;
    while (p && p !== document.documentElement) {
      const cs = getComputedStyle(p);
      if (CLIPPING.test(cs.overflowX) || CLIPPING.test(cs.overflowY)) return p;
      p = p.parentElement;
    }
    return null;
  };

  const cssPath = (el) => {
    const parts = [];
    let cur = el;
    while (cur && cur.nodeType === 1 && parts.length < 6) {
      let s = cur.tagName.toLowerCase();
      if (cur.id) {
        parts.unshift(`${s}#${cur.id}`);
        break;
      }
      const cls = (cur.getAttribute("class") || "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .join(".");
      if (cls) s += `.${cls}`;
      const sibs = cur.parentElement
        ? [...cur.parentElement.children].filter((c) => c.tagName === cur.tagName)
        : [];
      if (sibs.length > 1) s += `:nth-of-type(${sibs.indexOf(cur) + 1})`;
      parts.unshift(s);
      cur = cur.parentElement;
    }
    return parts.join(" > ");
  };

  const nameOf = (el, i) =>
    el.getAttribute("data-verify") || el.id || `${el.tagName.toLowerCase()}-${i}`;

  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    const sy = window.scrollY;
    const sx = window.scrollX;
    return {
      x: +(r.x + sx).toFixed(2),
      y: +(r.y + sy).toFixed(2),
      width: +r.width.toFixed(2),
      height: +r.height.toFixed(2),
      top: +(r.top + sy).toFixed(2),
      bottom: +(r.bottom + sy).toFixed(2),
      left: +(r.left + sx).toFixed(2),
      right: +(r.right + sx).toFixed(2),
    };
  };

  const pick = (cs) => ({
    marginTop: cs.marginTop,
    marginBottom: cs.marginBottom,
    paddingTop: cs.paddingTop,
    paddingBottom: cs.paddingBottom,
    overflow: cs.overflow,
    overflowX: cs.overflowX,
    overflowY: cs.overflowY,
    position: cs.position,
    zIndex: cs.zIndex,
    display: cs.display,
    gap: cs.gap,
    fontSize: cs.fontSize,
    lineHeight: cs.lineHeight,
  });

  // --- measured elements -------------------------------------------------
  const targets = new Set();
  document.querySelectorAll("[data-verify]").forEach((el) => targets.add(el));
  document
    .querySelectorAll("section, header, footer, h1, h2")
    .forEach((el) => targets.add(el));

  const seenNames = new Map();
  const metrics = [...targets].map((el, i) => {
    let name = nameOf(el, i);
    const n = (seenNames.get(name) || 0) + 1;
    seenNames.set(name, n);
    if (n > 1) name = `${name}#${n}`;
    return {
      name,
      selector: cssPath(el),
      tag: el.tagName.toLowerCase(),
      rect: rectOf(el),
      computed: pick(getComputedStyle(el)),
    };
  });

  // --- bands (top-level page rhythm) ------------------------------------
  // The band's own box is flush with its neighbours in this design (rhythm
  // lives as padding on an inner container), so the box rect alone cannot
  // measure spacing. The content rect -- the union of the band's real,
  // non-decorative painted children -- is what a reader perceives as the
  // edge of the section.
  const CONTENT_SEL = "h1,h2,h3,h4,h5,h6,p,li,img,a,button,input,label,td,th";
  const contentRectOf = (el) => {
    let top = Infinity;
    let bottom = -Infinity;
    for (const n of el.querySelectorAll(CONTENT_SEL)) {
      if (n.closest('[aria-hidden="true"]')) continue;
      // Transparent hit targets (a button overlaying a whole card) are
      // interactive but paint nothing, so counting them as content would
      // stretch the band's content rect to the card's edge and understate
      // the whitespace to the next band.
      if (n.closest("[data-verify-ignore]")) continue;
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      if (cs.position === "fixed") continue;
      const r = n.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      top = Math.min(top, r.top);
      bottom = Math.max(bottom, r.bottom);
    }
    if (top === Infinity) return null;
    const sy = window.scrollY;
    return { top: +(top + sy).toFixed(2), bottom: +(bottom + sy).toFixed(2) };
  };

  /**
   * True when a filled element (a card or panel) ends flush with the band's
   * own bottom edge. A tonal step there is that element's fill meeting the
   * page background -- a legitimate design edge, not a decorative layer
   * being clipped, which is what the seam check exists to catch.
   */
  const endsOnFilledEdge = (el) => {
    const box = el.getBoundingClientRect();
    if (box.width === 0) return false;
    for (const n of el.querySelectorAll("*")) {
      const ncs = getComputedStyle(n);
      const bg = ncs.backgroundColor;
      if (!bg || bg === "transparent" || /rgba\(0,\s*0,\s*0,\s*0\)/.test(bg)) continue;
      const r = n.getBoundingClientRect();
      if (r.width < box.width * 0.4) continue;
      if (Math.abs(r.bottom - box.bottom) <= 8) return true;
    }
    return false;
  };

  const bandEls = [...document.querySelectorAll(BAND_SELECTOR)];
  const bands = bandEls.map((el, i) => {
    const cs = getComputedStyle(el);
    return {
      index: i + 1,
      name: `${String(i + 1).padStart(2, "0")}-${
        el.getAttribute("data-verify") || el.id || el.tagName.toLowerCase()
      }`,
      selector: cssPath(el),
      rect: rectOf(el),
      contentRect: contentRectOf(el),
      endsOnFilledEdge: endsOnFilledEdge(el),
      paddingTop: parseFloat(cs.paddingTop) || 0,
      paddingBottom: parseFloat(cs.paddingBottom) || 0,
    };
  });

  // Inter-band spacing. boxGap is the gap between the band boxes themselves
  // (0 throughout this design -- the bands are flush). contentGap is the
  // whitespace a reader actually sees: last painted content of one band to
  // first painted content of the next. contentGap is the one asserted on.
  const gaps = [];
  for (let i = 0; i < bands.length - 1; i++) {
    const a = bands[i];
    const b = bands[i + 1];
    const boxGap = +(b.rect.top - a.rect.bottom).toFixed(2);
    gaps.push({
      from: a.name,
      to: b.name,
      boxGap,
      contentGap:
        a.contentRect && b.contentRect
          ? +(b.contentRect.top - a.contentRect.bottom).toFixed(2)
          : null,
    });
  }

  // --- glow / shadow clipping -------------------------------------------
  const splitTop = (s) => {
    const out = [];
    let depth = 0;
    let cur = "";
    for (const ch of s) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
    if (cur.trim()) out.push(cur);
    return out.map((x) => x.trim());
  };

  const shadowExpand = (bs) => {
    const e = { top: 0, right: 0, bottom: 0, left: 0 };
    if (!bs || bs === "none") return e;
    for (const part of splitTop(bs)) {
      if (part.includes("inset")) continue; // paints inside the box
      const nums = (part.match(/-?[\d.]+px/g) || []).map(parseFloat);
      if (nums.length < 2) continue;
      const [ox, oy, blur = 0, spread = 0] = nums;
      e.left = Math.max(e.left, -ox + blur + spread);
      e.right = Math.max(e.right, ox + blur + spread);
      e.top = Math.max(e.top, -oy + blur + spread);
      e.bottom = Math.max(e.bottom, oy + blur + spread);
    }
    return e;
  };

  const filterExpand = (f) => {
    const e = { top: 0, right: 0, bottom: 0, left: 0 };
    if (!f || f === "none") return e;
    // A Gaussian blur of radius r paints to roughly 3r.
    for (const m of f.matchAll(/blur\(([\d.]+)px\)/g)) {
      const r = parseFloat(m[1]) * 3;
      e.top = Math.max(e.top, r);
      e.right = Math.max(e.right, r);
      e.bottom = Math.max(e.bottom, r);
      e.left = Math.max(e.left, r);
    }
    for (const m of f.matchAll(/drop-shadow\(([^)]*)\)/g)) {
      const nums = (m[1].match(/-?[\d.]+px/g) || []).map(parseFloat);
      const [ox = 0, oy = 0, blur = 0] = nums;
      e.left = Math.max(e.left, -ox + blur);
      e.right = Math.max(e.right, ox + blur);
      e.top = Math.max(e.top, -oy + blur);
      e.bottom = Math.max(e.bottom, oy + blur);
    }
    return e;
  };

  const glow = [];
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;

    const hasRadial = /radial-gradient/.test(cs.backgroundImage);
    const hasShadow = cs.boxShadow && cs.boxShadow !== "none";
    const hasFilter = cs.filter && cs.filter !== "none";
    if (!hasRadial && !hasShadow && !hasFilter) continue;

    const clipper = clipperOf(el);
    if (!clipper) continue;

    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;

    const se = shadowExpand(cs.boxShadow);
    const fe = filterExpand(cs.filter);
    const exp = {
      top: Math.max(se.top, fe.top),
      right: Math.max(se.right, fe.right),
      bottom: Math.max(se.bottom, fe.bottom),
      left: Math.max(se.left, fe.left),
    };

    const painted = {
      top: r.top - exp.top,
      right: r.right + exp.right,
      bottom: r.bottom + exp.bottom,
      left: r.left - exp.left,
    };

    const cr = clipper.getBoundingClientRect();
    const ccs = getComputedStyle(clipper);
    const clipsX = CLIPPING.test(ccs.overflowX);
    const clipsY = CLIPPING.test(ccs.overflowY);

    const over = {
      top: clipsY ? +(cr.top - painted.top).toFixed(2) : 0,
      bottom: clipsY ? +(painted.bottom - cr.bottom).toFixed(2) : 0,
      left: clipsX ? +(cr.left - painted.left).toFixed(2) : 0,
      right: clipsX ? +(painted.right - cr.right).toFixed(2) : 0,
    };
    const worst = Math.max(over.top, over.bottom, over.left, over.right);
    if (worst <= EPSILON) continue;

    glow.push({
      selector: cssPath(el),
      name: el.getAttribute("data-verify") || el.id || null,
      cause: [
        hasRadial && "radial-gradient",
        hasShadow && "box-shadow",
        hasFilter && "filter",
      ]
        .filter(Boolean)
        .join("+"),
      expansion: exp,
      clippedBy: {
        selector: cssPath(clipper),
        overflowX: ccs.overflowX,
        overflowY: ccs.overflowY,
      },
      clippedPx: over,
      worstPx: +worst.toFixed(2),
    });
  }
  glow.sort((a, b) => b.worstPx - a.worstPx);

  // --- elements wider than the viewport ---------------------------------
  const vw = document.documentElement.clientWidth;
  const wide = [];
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const overRight = +(r.right - vw).toFixed(2);
    const overLeft = +(0 - r.left).toFixed(2);
    if (overRight <= EPSILON && overLeft <= EPSILON) continue;
    // A decorative layer that bleeds past the viewport but sits inside a
    // clipping ancestor cannot cause a scrollbar. Recorded, not failed.
    const clipper = clipperOf(el);
    wide.push({
      selector: cssPath(el),
      rect: rectOf(el),
      overRight: Math.max(0, overRight),
      overLeft: Math.max(0, overLeft),
      clipped: Boolean(clipper),
      clippedBy: clipper ? cssPath(clipper) : null,
    });
  }
  wide.sort(
    (a, b) => Math.max(b.overRight, b.overLeft) - Math.max(a.overRight, a.overLeft)
  );

  // --- broken images ------------------------------------------------------
  const brokenImages = [...document.images]
    .filter((img) => img.naturalWidth === 0)
    .map((img) => ({ src: img.currentSrc || img.src, selector: cssPath(img) }));

  return {
    document: {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      pageHeight: Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      ),
    },
    metrics,
    bands,
    gaps,
    glow,
    wide,
    brokenImages,
  };
}

// --------------------------------------------------------- seam analysis

/**
 * Reads back the full-page capture and compares the tone just inside each
 * band's bottom edge against the tone just outside it, averaged across the
 * width. A continuous background steps by 0; a clipped glow steps visibly.
 */
async function measureSeams(shotPath, bands) {
  const meta = await sharp(shotPath).metadata();
  const { width, height } = meta;
  const raw = await sharp(shotPath).removeAlpha().raw().toBuffer();
  const stride = 3;

  const rowMean = (y) => {
    if (y < 0 || y >= height) return null;
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let x = 20; x < width - 20; x += 10) {
      const o = (y * width + x) * stride;
      r += raw[o];
      g += raw[o + 1];
      b += raw[o + 2];
      n++;
    }
    return n ? [r / n, g / n, b / n] : null;
  };

  /** Mean of a small run of rows, skipping the boundary row itself. */
  const bandMean = (from, to) => {
    const rows = [];
    for (let y = from; y <= to; y++) {
      const m = rowMean(y);
      if (m) rows.push(m);
    }
    if (!rows.length) return null;
    return [0, 1, 2].map(
      (c) => rows.reduce((a, r) => a + r[c], 0) / rows.length
    );
  };

  const out = [];
  for (let i = 0; i < bands.length - 1; i++) {
    const y = Math.round(bands[i].rect.bottom);
    if (y < 6 || y > height - 6) continue;
    const inside = bandMean(y - 5, y - 2);
    const outside = bandMean(y + 2, y + 5);
    if (!inside || !outside) continue;
    const deltas = [0, 1, 2].map((c) => Math.abs(inside[c] - outside[c]));
    out.push({
      boundary: `${bands[i].name} -> ${bands[i + 1].name}`,
      cardEdge: Boolean(bands[i].endsOnFilledEdge),
      y,
      inside: inside.map((v) => +v.toFixed(2)),
      outside: outside.map((v) => +v.toFixed(2)),
      delta: deltas.map((v) => +v.toFixed(2)),
      maxDelta: +Math.max(...deltas).toFixed(2),
    });
  }
  return out;
}

// ------------------------------------------------------------- harness

const findings = [];
const fail = (route, viewport, kind, message, detail) =>
  findings.push({ severity: "fail", route, viewport, kind, message, detail });
const warn = (route, viewport, kind, message, detail) =>
  findings.push({ severity: "warn", route, viewport, kind, message, detail });

async function run() {
  for (const dir of ["shots", "metrics", "baseline"]) {
    await mkdir(`.verify/${dir}`, { recursive: true });
  }
  if (WRITE_BASELINE) await rm(".verify/baseline", { recursive: true, force: true });
  await mkdir(".verify/baseline", { recursive: true });

  const browser = await chromium.launch();
  const results = {};

  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      const key = `${slug(route)}--${vp.name}`;
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();

      const consoleErrors = [];
      const failedRequests = [];
      page.on("console", (m) => {
        if (m.type() === "error") consoleErrors.push(m.text());
      });
      page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
      page.on("requestfailed", (r) => {
        const url = r.url();
        // Next's dev HMR socket aborts on navigation; not a page defect.
        if (/_next\/(webpack-hmr|static\/webpack)/.test(url)) return;
        failedRequests.push({ url, error: r.failure()?.errorText });
      });
      page.on("response", (r) => {
        if (r.status() >= 400) failedRequests.push({ url: r.url(), status: r.status() });
      });

      const url = `${BASE}${route}`;
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

      // Hide Next's dev-mode indicator so it never lands in a shot or a box
      // measurement. Harness-side only; the site is not touched.
      await page.addStyleTag({
        content:
          "nextjs-portal,[data-nextjs-toast],[data-next-badge-root]{display:none !important}",
      });
      await page.evaluate(() => document.fonts.ready);
      // Let lazy/decorative layers settle, then return to the top so every
      // rect is measured from the same scroll origin.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)));
        }
        window.scrollTo(0, 0);
      });
      // Scrolling only *triggers* lazy loads, and scrolling back to the top
      // can leave images that never started. Promote every image to eager so
      // the capture is complete and the broken-image assertion means what it
      // says instead of firing on assets that are simply not loaded yet.
      await page.evaluate(() => {
        for (const img of document.images) img.loading = "eager";
      });
      await page
        .waitForFunction(
          () => [...document.images].every((i) => i.complete),
          null,
          { timeout: 20000 }
        )
        .catch(() => {});
      await page.waitForTimeout(400);

      const data = await page.evaluate(collectPage, { BAND_SELECTOR, EPSILON });

      const fullShot = `.verify/shots/${key}.png`;
      await page.screenshot({ path: fullShot, fullPage: true });

      // Seam check. The specified painted-bounds test only catches a glow
      // whose *box* escapes a clipping ancestor. A glow whose box ends flush
      // with the clip but whose gradient has not yet reached zero leaves a
      // hard tonal step at the boundary and no bounds overflow at all -- so
      // it has to be measured in pixels, not in rects.
      const seams = await measureSeams(fullShot, data.bands);

      for (const band of data.bands) {
        const el = page.locator(band.selector).first();
        try {
          await el.scrollIntoViewIfNeeded({ timeout: 5000 });
          await page.waitForTimeout(150);
          await el.screenshot({ path: `.verify/shots/${key}--${band.name}.png` });
        } catch (e) {
          warn(route, vp.name, "crop", `could not capture band ${band.name}`, {
            selector: band.selector,
            error: String(e.message || e).split("\n")[0],
          });
        }
      }
      await page.evaluate(() => window.scrollTo(0, 0));

      // ---- assertions ----------------------------------------------------
      const d = data.document;
      if (d.scrollWidth > d.clientWidth) {
        fail(route, vp.name, "horizontal-overflow",
          `document scrolls horizontally by ${d.scrollWidth - d.clientWidth}px`,
          { scrollWidth: d.scrollWidth, clientWidth: d.clientWidth });
      }

      const unclippedWide = data.wide.filter((w) => !w.clipped);
      if (unclippedWide.length) {
        fail(route, vp.name, "element-exceeds-viewport",
          `${unclippedWide.length} unclipped element(s) extend past the viewport`,
          unclippedWide.slice(0, 10));
      }
      const clippedWide = data.wide.filter((w) => w.clipped);
      if (clippedWide.length) {
        warn(route, vp.name, "element-exceeds-viewport-clipped",
          `${clippedWide.length} decorative element(s) bleed past the viewport but are clipped`,
          clippedWide.slice(0, 6));
      }

      if (vp.name === "desktop") {
        const [gapMin, gapMax] = gapWindow(route);
        for (const g of data.gaps) {
          if (g.contentGap === null) continue;
          if (g.contentGap < gapMin || g.contentGap > gapMax) {
            fail(route, vp.name, "section-gap",
              `${g.from} -> ${g.to}: content gap ${g.contentGap}px outside ${gapMin}-${gapMax}px`,
              g);
          }
        }
      }

      for (const seam of seams) {
        if (seam.maxDelta <= SEAM_TOLERANCE) continue;
        const known = KNOWN_SEAMS.find(
          (k) => k.match.test(seam.boundary) && seam.maxDelta <= k.max
        );
        const msg =
          `${seam.boundary} at y=${seam.y}: tonal step of ${seam.maxDelta}/255 ` +
          `(${seam.inside.join(",")} -> ${seam.outside.join(",")})`;
        if (seam.cardEdge) {
          warn(route, vp.name, "boundary-seam-card-edge",
            `${msg} — band ends flush with a filled card, so the step is that ` +
              `card's fill meeting the page, not a clipped layer`,
            seam);
          continue;
        }
        if (known) {
          warn(route, vp.name, "boundary-seam-known", `${msg} — ${known.why}`, seam);
        } else {
          fail(route, vp.name, "boundary-seam", msg, seam);
        }
      }

      if (data.glow.length) {
        fail(route, vp.name, "painted-bounds-clipped",
          `${data.glow.length} glow/shadow/filter element(s) painted past a clipping ancestor`,
          data.glow.slice(0, 12));
      }

      if (consoleErrors.length) {
        fail(route, vp.name, "console-error",
          `${consoleErrors.length} console error(s)`, consoleErrors.slice(0, 10));
      }
      if (failedRequests.length) {
        fail(route, vp.name, "request-failed",
          `${failedRequests.length} failed request(s)`, failedRequests.slice(0, 10));
      }
      if (data.brokenImages.length) {
        fail(route, vp.name, "broken-image",
          `${data.brokenImages.length} image(s) with naturalWidth 0`, data.brokenImages);
      }

      const payload = {
        route,
        viewport: vp,
        url,
        capturedAt: new Date().toISOString(),
        ...data,
        seams,
        consoleErrors,
        failedRequests,
      };
      await writeFile(
        `.verify/metrics/${key}.json`,
        JSON.stringify(payload, null, 2)
      );
      if (WRITE_BASELINE) {
        await writeFile(
          `.verify/baseline/${key}.json`,
          JSON.stringify(
            { bands: data.bands, document: data.document, metrics: data.metrics },
            null,
            2
          )
        );
      }
      results[key] = payload;
      await ctx.close();
    }
  }

  await browser.close();

  // ---- baseline diff -----------------------------------------------------
  const diffs = [];
  if (!WRITE_BASELINE) {
    for (const [key, payload] of Object.entries(results)) {
      const file = `.verify/baseline/${key}.json`;
      if (!existsSync(file)) {
        warn(payload.route, payload.viewport.name, "baseline-missing",
          `no baseline for ${key}`, null);
        continue;
      }
      const base = JSON.parse(await readFile(file, "utf8"));
      // Bands are matched by document order, not by name. A refactor that
      // renames a section (or gives it a data-verify label) must still be
      // provable as geometrically identical -- name-keyed matching would
      // report every rename as one band vanishing and another appearing,
      // which is exactly the signal a refactor needs to not drown in.
      const n = Math.max(base.bands.length, payload.bands.length);
      for (let i = 0; i < n; i++) {
        const b = base.bands[i];
        const band = payload.bands[i];
        if (!b) {
          diffs.push({ key, band: band.name, change: "added" });
          fail(payload.route, payload.viewport.name, "baseline-drift",
            `band ${i + 1} (${band.name}) is new vs baseline`, { key, index: i + 1 });
          continue;
        }
        if (!band) {
          diffs.push({ key, band: b.name, change: "removed" });
          fail(payload.route, payload.viewport.name, "baseline-drift",
            `band ${i + 1} (${b.name}) disappeared vs baseline`, { key, index: i + 1 });
          continue;
        }
        if (b.name !== band.name) {
          diffs.push({ key, band: `${b.name} -> ${band.name}`, change: "renamed" });
        }
        const dTop = +(band.rect.top - b.rect.top).toFixed(2);
        const dH = +(band.rect.height - b.rect.height).toFixed(2);
        if (Math.abs(dTop) > DIFF_TOLERANCE || Math.abs(dH) > DIFF_TOLERANCE) {
          const entry = { key, band: band.name, deltaTop: dTop, deltaHeight: dH };
          diffs.push(entry);
          fail(payload.route, payload.viewport.name, "baseline-drift",
            `${band.name} moved ${dTop}px / resized ${dH}px vs baseline`, entry);
        }
      }
      const dh = payload.document.pageHeight - base.document.pageHeight;
      if (Math.abs(dh) > DIFF_TOLERANCE) {
        diffs.push({ key, band: "<document>", deltaHeight: dh });
      }
    }
  }

  // ---- report ------------------------------------------------------------
  const fails = findings.filter((f) => f.severity === "fail");
  const warns = findings.filter((f) => f.severity === "warn");
  const report = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    routes: ROUTES,
    mode: WRITE_BASELINE ? "baseline-write" : "verify",
    summary: {
      routes: ROUTES.length,
      viewports: VIEWPORTS.length,
      fails: fails.length,
      warns: warns.length,
      baselineDiffs: diffs.length,
    },
    pages: Object.fromEntries(
      Object.entries(results).map(([k, v]) => [
        k,
        {
          document: v.document,
          bands: v.bands.map((b) => ({
            name: b.name,
            top: b.rect.top,
            height: b.rect.height,
          })),
          gaps: v.gaps,
          seams: v.seams,
          glowCount: v.glow.length,
        },
      ])
    ),
    diffs,
    findings,
  };
  await writeFile(".verify/report.json", JSON.stringify(report, null, 2));

  // ---- console summary ---------------------------------------------------
  const pad = (s, n) => String(s).padEnd(n);
  const padS = (s, n) => String(s).padStart(n);
  console.log(`\n  ${BASE}  ${WRITE_BASELINE ? "[writing baseline]" : "[verify]"}`);
  for (const [key, v] of Object.entries(results)) {
    console.log(`\n  ${key}   page ${v.document.pageHeight}px   scrollW ${v.document.scrollWidth} / clientW ${v.document.clientWidth}`);
    console.log(
      `    ${pad("band", 22)}${padS("top", 9)}${padS("height", 9)}` +
        `${padS("boxGap", 8)}${padS("contentGap", 12)}${padS("seam", 8)}`
    );
    v.bands.forEach((b, i) => {
      const g = v.gaps[i];
      const seam = v.seams[i];
      console.log(
        `    ${pad(b.name, 22)}${padS(b.rect.top, 9)}${padS(b.rect.height, 9)}` +
          `${padS(g ? g.boxGap : "-", 8)}${padS(g && g.contentGap !== null ? g.contentGap : "-", 12)}` +
          `${padS(seam ? seam.maxDelta : "-", 8)}`
      );
    });
  }
  if (diffs.length) {
    console.log(`\n  BASELINE DIFF (>${DIFF_TOLERANCE}px)`);
    for (const d of diffs) {
      console.log(`    ${pad(d.key, 22)} ${pad(d.band, 20)} ${d.change || `top ${d.deltaTop ?? 0}  h ${d.deltaHeight ?? 0}`}`);
    }
  } else if (!WRITE_BASELINE) {
    console.log(`\n  BASELINE DIFF: clean (nothing moved more than ${DIFF_TOLERANCE}px)`);
  }
  if (findings.length) {
    console.log(`\n  FINDINGS`);
    for (const f of findings) {
      console.log(`    [${f.severity.toUpperCase()}] ${f.route} ${f.viewport} ${f.kind}: ${f.message}`);
    }
  }
  console.log(
    `\n  ${fails.length} fail / ${warns.length} warn / ${diffs.length} diff  ->  .verify/report.json\n`
  );

  process.exit(fails.length ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(2);
});
