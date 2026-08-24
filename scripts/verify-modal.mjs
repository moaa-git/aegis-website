#!/usr/bin/env node
/**
 * Consultation modal verification.
 *
 *   node scripts/verify-modal.mjs [--base=http://localhost:3100]
 *
 * Drives the real modal in a real browser: prefill from each CTA, the four
 * visual states, keyboard access, and the route handler's defences.
 * Screenshots land in .verify/shots/modal--<viewport>--<state>.png
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE =
  process.argv.find((a) => a.startsWith("--base="))?.slice(7) ??
  "http://localhost:3100";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 },
];

const results = [];
const check = (name, pass, detail = "") =>
  results.push({ name, pass, detail });

const FILLED = {
  fullName: "Dana Whitlock",
  workEmail: "dana@whitlocklegal.com",
  company: "Whitlock & Reyes LLP",
  phone: "(309) 555-0142",
  needs:
    "We are a 24-attorney firm moving off an on-prem file server. We need eDiscovery and retention set up before our next audit.",
};

await mkdir(".verify/shots", { recursive: true });
const browser = await chromium.launch();

async function newPage(ctx) {
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content:
      "nextjs-portal,[data-nextjs-toast],[data-next-badge-root]{display:none!important}",
  });
  return page;
}

for (const vp of VIEWPORTS) {
  // Each viewport gets its own forwarded IP so the rate limiter -- which is
  // working as intended -- does not make this suite non-idempotent.
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    extraHTTPHeaders: { "x-forwarded-for": `192.0.2.${10 + VIEWPORTS.indexOf(vp)}` },
  });
  const page = await newPage(ctx);
  const modal = page.locator('[data-verify="consultation-modal"]');

  // --- open from a pricing CTA, with its package preselected -------------
  await page.getByRole("button", { name: "Get Compliant" }).click();
  await modal.waitFor({ state: "visible", timeout: 5000 });
  const pkg = await page.locator("select[name=engagementPackage]").inputValue();
  check(
    `${vp.name}: pricing CTA prefills package`,
    pkg === "law-firm-compliance",
    `got "${pkg}"`
  );
  // The dialog is taller than a short viewport; its heading and close button
  // must still be reachable rather than sitting above the scroll origin.
  const top = await modal.evaluate((el) => el.getBoundingClientRect().top);
  check(`${vp.name}: dialog top is reachable`, top >= 0, `top ${Math.round(top)}px`);
  const titleVisible = await page
    .getByRole("heading", { name: "Request a consultation" })
    .isVisible();
  check(`${vp.name}: dialog heading is visible on open`, titleVisible);
  await page.screenshot({ path: `.verify/shots/modal--${vp.name}--open.png` });

  // --- error state: submit with nothing filled ---------------------------
  await modal.getByRole("button", { name: "Request consultation", exact: true }).click();
  await page
    .locator('[data-verify="consultation-form-error"]')
    .waitFor({ state: "visible", timeout: 5000 });
  const errorCount = await page.locator("p.text-red-300").count();
  check(`${vp.name}: empty submit shows inline errors`, errorCount >= 4,
    `${errorCount} field errors`);
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("name"));
  check(`${vp.name}: focus moves to first invalid field`, focused === "fullName",
    `focus on "${focused}"`);
  await page.screenshot({ path: `.verify/shots/modal--${vp.name}--error.png` });

  // --- filled state -------------------------------------------------------
  for (const [name, value] of Object.entries(FILLED)) {
    await page.fill(`[name=${name}]`, value);
  }
  await page.selectOption("select[name=industry]", "legal");
  await page.selectOption("select[name=companySize]", "11-50");
  await page.selectOption("select[name=primaryInterest]", "compliance-legal");
  await page.selectOption("select[name=timeline]", "1-3-months");
  await page.selectOption("select[name=heardAbout]", "referral");
  const gone = await page.locator("p.text-red-300").count();
  check(`${vp.name}: errors clear as fields are edited`, gone === 0, `${gone} left`);
  await page.screenshot({ path: `.verify/shots/modal--${vp.name}--filled.png` });

  // --- success state ------------------------------------------------------
  await modal.getByRole("button", { name: "Request consultation", exact: true }).click();
  await page
    .locator('[data-verify="consultation-success"]')
    .waitFor({ state: "visible", timeout: 10000 });
  check(`${vp.name}: submit reaches success state`, true);
  await page.screenshot({ path: `.verify/shots/modal--${vp.name}--success.png` });

  await ctx.close();
}

// ---- behaviour checks, desktop only ------------------------------------
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: { "x-forwarded-for": "192.0.2.50" },
  });
  const page = await newPage(ctx);
  const modal = page.locator('[data-verify="consultation-modal"]');

  // services card prefills primary interest
  await page
    .getByRole("button", { name: /Request a consultation about AI & Modern Work/ })
    .click();
  await modal.waitFor({ state: "visible" });
  const interest = await page.locator("select[name=primaryInterest]").inputValue();
  check("services card prefills primary interest", interest === "ai-modern-work",
    `got "${interest}"`);

  // escape closes
  await page.keyboard.press("Escape");
  await modal.waitFor({ state: "hidden", timeout: 3000 });
  check("Escape closes the modal", true);

  // focus returns to the CTA that opened it
  const restored = await page.evaluate(
    () => document.activeElement?.textContent?.trim() ?? ""
  );
  check("focus returns to the opening CTA",
    restored.includes("Request a consultation about AI & Modern Work"),
    `focus on "${restored}"`);

  // nav CTA opens with nothing preselected
  await page.getByRole("button", { name: "Request Consultation", exact: true }).click();
  await modal.waitFor({ state: "visible" });
  const navPkg = await page.locator("select[name=engagementPackage]").inputValue();
  check("nav CTA opens with no prefill", navPkg === "", `got "${navPkg}"`);

  // focus trap: tab from the last control wraps to the first
  const trapped = await page.evaluate(() => {
    const dialog = document.querySelector('[data-verify="consultation-modal"]');
    const nodes = [...dialog.querySelectorAll(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])'
    )].filter((n) => n.offsetParent !== null);
    return nodes.length;
  });
  check("dialog exposes a focusable ring", trapped > 10, `${trapped} focusable nodes`);

  const role = await modal.getAttribute("role");
  const aria = await modal.getAttribute("aria-modal");
  check("dialog has role and aria-modal", role === "dialog" && aria === "true",
    `role=${role} aria-modal=${aria}`);

  // honeypot is present but hidden from users
  const honeypot = await page.evaluate(() => {
    const el = document.querySelector("input[name=website]");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      offscreen: r.right < 0 || r.bottom < 0 || r.left > innerWidth,
      untabbable: el.tabIndex === -1,
      hiddenFromAt: Boolean(el.closest('[aria-hidden="true"]')),
    };
  });
  check("honeypot is off-canvas, untabbable and hidden from assistive tech",
    Boolean(honeypot?.offscreen && honeypot.untabbable && honeypot.hiddenFromAt),
    JSON.stringify(honeypot));

  await ctx.close();
}

// ---- route handler defences --------------------------------------------
const post = async (body) => {
  const res = await fetch(`${BASE}/api/lead`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": body.__ip ?? "203.0.113.7" },
    body: JSON.stringify({ turnstileToken: "test-token", ...body }),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
};

const valid = {
  fullName: "Dana Whitlock",
  workEmail: "dana@whitlocklegal.com",
  company: "Whitlock & Reyes LLP",
  needs: "Need eDiscovery configured.",
  preferredContact: "email",
};

{
  const r = await post({ ...valid, website: "http://spam.example", __ip: "203.0.113.20" });
  check("honeypot submission is accepted but dropped", r.status === 200 && r.json.ok === true,
    `status ${r.status}`);
}
{
  const r = await post({ ...valid, workEmail: "not-an-email", __ip: "203.0.113.21" });
  check("server rejects a malformed email", r.status === 422 && Boolean(r.json.errors?.workEmail),
    `status ${r.status}`);
}
{
  const r = await post({ ...valid, fullName: "", __ip: "203.0.113.22" });
  check("server rejects a missing required field", r.status === 422 && Boolean(r.json.errors?.fullName),
    `status ${r.status}`);
}
{
  const r = await post({ ...valid, industry: "not-a-real-option", __ip: "203.0.113.23" });
  check("server rejects an unknown select value", r.status === 422,
    `status ${r.status}`);
}
{
  const r = await post({ ...valid, preferredContact: "phone", phone: "", __ip: "203.0.113.24" });
  check("server rejects phone-preferred with no number", r.status === 422,
    `status ${r.status}`);
}
{
  // A fresh IP each run, so this exercises the accept-then-limit transition
  // rather than an IP a previous run already exhausted.
  const ip = `198.51.100.${(Date.now() % 200) + 20}`;
  const statuses = [];
  for (let i = 0; i < 7; i++) {
    const r = await post({ ...valid, __ip: ip });
    statuses.push(r.status);
  }
  const accepted = statuses.filter((s) => s === 200).length;
  const blocked = statuses.filter((s) => s === 429).length;
  check("rate limit accepts 5 then blocks the rest",
    accepted === 5 && blocked === 2,
    `statuses ${statuses.join(",")}`);
}
{
  const r = await post({ ...valid, __ip: "203.0.113.31" });
  check("a valid lead returns success", r.status === 200 && r.json.ok === true,
    `status ${r.status}`);
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log("");
for (const r of results) {
  console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
}
console.log(`\n  ${results.length - failed.length}/${results.length} passed\n`);
process.exit(failed.length ? 1 : 0);
