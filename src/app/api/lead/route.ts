import { NextResponse } from "next/server";
import {
  EMPTY_LEAD,
  HEARD_ABOUT,
  INDUSTRIES,
  COMPANY_SIZES,
  ENGAGEMENT_PACKAGES,
  TIMELINES,
  PRIMARY_INTERESTS,
  labelFor,
  parseInterests,
  validateLead,
  type LeadInput,
} from "@/lib/consultation-fields";
import {
  METADATA_FIELD,
  companyOrFallback,
  toZohoPayload,
  type LeadMeta,
  zohoConfig,
} from "@/lib/zoho-mapping";
import {
  TURNSTILE_ACTION,
  TURNSTILE_TEST_KEYS,
  isProductionContext,
} from "@/lib/turnstile";

export const runtime = "nodejs";
/** Never cached: every POST must run the checks. */
export const dynamic = "force-dynamic";

/**
 * 15 per hour per IP. Loosened from 5-per-10-minutes because the buyer here
 * is often a whole office behind one NAT -- a law firm where five people
 * enquire in ten minutes is a plausible day, and blocking the fifth costs a
 * real lead. Turnstile is what actually stops bots; this is a speed bump for
 * someone hammering the endpoint directly.
 */
const RATE_LIMIT = { windowMs: 60 * 60 * 1000, max: 15 };

/**
 * Hostnames the Turnstile token may have been solved on. The sitekey is
 * public, so without this check a token minted on someone else's page is
 * accepted here -- the hostname comparison is what actually prevents reuse.
 */
const ALLOWED_HOSTNAMES = (
  process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? "aegisascent.com,www.aegisascent.com"
)
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

/**
 * In-memory sliding window, keyed by IP.
 *
 * Deliberately simple, and deliberately per-instance: it survives a restart
 * no better than it survives scale-out. It is a speed bump for a crude
 * flood, not a security control -- Turnstile is what actually stops bots.
 * If this ever runs on more than one instance, move it to shared storage.
 */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT.windowMs;
  const recent = (hits.get(ip) ?? []).filter((t) => t > cutoff);
  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic sweep so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => t > cutoff)) hits.delete(key);
    }
  }
  return recent.length > RATE_LIMIT.max;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * The production secret only in a production context; elsewhere Cloudflare's
 * dummy secret, matching the dummy sitekey the widget renders. See
 * src/lib/turnstile.ts.
 */
function turnstileSecret(): string {
  if (!isProductionContext) {
    return process.env.TURNSTILE_TEST_MODE === "fail"
      ? TURNSTILE_TEST_KEYS.fail.secret
      : TURNSTILE_TEST_KEYS.pass.secret;
  }
  return process.env.TURNSTILE_SECRET_KEY ?? "";
}

type TurnstileResult = {
  ok: boolean;
  hostname: string;
  action: string;
  reason: string;
};

/**
 * Cloudflare Turnstile. With no secret configured, verification is skipped
 * and a warning is logged -- the form stays usable on a box that has no keys
 * rather than failing closed. In production the secret must be set; an unset
 * secret there is a misconfiguration, and the warning is the signal.
 */
async function verifyTurnstile(token: string, ip: string): Promise<TurnstileResult> {
  const secret = turnstileSecret();
  if (!secret) {
    console.warn(
      "[lead] No Turnstile secret resolved -- skipping bot verification. " +
        "Do not run production this way."
    );
    return { ok: true, hostname: "", action: "", reason: "unconfigured" };
  }
  if (!token) {
    return { ok: false, hostname: "", action: "", reason: "no token" };
  }

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      }
    );
    const data = (await res.json()) as {
      success?: boolean;
      hostname?: string;
      action?: string;
      "error-codes"?: string[];
    };
    const hostname = data.hostname ?? "";
    const action = data.action ?? "";

    if (data.success !== true) {
      return {
        ok: false,
        hostname,
        action,
        reason: (data["error-codes"] ?? ["rejected"]).join(","),
      };
    }

    // The sitekey is public; this is the check that stops a token solved on
    // another site from being replayed here. Enforced in production only --
    // the dummy keys report whatever hostname the dev box is served on.
    if (isProductionContext && hostname && !ALLOWED_HOSTNAMES.includes(hostname.toLowerCase())) {
      console.warn(
        `[lead] Turnstile token solved on unexpected hostname "${hostname}" -- rejected.`
      );
      return { ok: false, hostname, action, reason: "hostname not allowed" };
    }

    return { ok: true, hostname, action, reason: "verified" };
  } catch (err) {
    // A Cloudflare outage must not take the form down with it.
    console.error("[lead] Turnstile verification failed to complete:", err);
    return { ok: true, hostname: "", action: "", reason: "siteverify unreachable" };
  }
}

async function forwardToZoho(
  lead: LeadInput,
  meta: LeadMeta
): Promise<{ ok: boolean; detail: string }> {
  const { payload, pending, metadata } = toZohoPayload(lead, meta);

  // WebToLead answers 200 with redirect HTML whether or not the record was
  // created, and there is no useful error body -- so the outbound payload is
  // logged in full every time. Comparing it against the Leads list is the
  // only way a silent mapping failure becomes diagnosable.
  console.info(
    "[lead] outbound Zoho payload:\n" +
      JSON.stringify(payload, null, 2) +
      (pending.length
        ? `\n[lead] carried in Description (slot pending): ${pending.join(" | ")}`
        : "") +
      `\n[lead] submission metadata${METADATA_FIELD ? "" : " (no slot, not forwarded)"}:\n${metadata}`
  );

  if (!zohoConfig.enabled) {
    console.info('[lead] Zoho forward is STUBBED (ZOHO_ENABLED is not "true").');
    return { ok: false, detail: "stubbed" };
  }

  try {
    const res = await fetch(zohoConfig.endpoint, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(payload),
    });
    if (!res.ok) return { ok: false, detail: `zoho responded ${res.status}` };
    return { ok: true, detail: "forwarded" };
  } catch (err) {
    return { ok: false, detail: `zoho request threw: ${String(err)}` };
  }
}

/**
 * Shout when a lead could not be delivered.
 *
 * This exists because the two things that would otherwise catch a failure are
 * both unavailable: Vercel log drains and log-based alerting need a Pro plan,
 * and Hobby retains runtime logs only briefly -- so "the lead is preserved in
 * the logs" stops being true within the hour. An alert that fires from the
 * application itself depends on no plan feature and no retention window.
 *
 * The whole lead goes in the body, not a "delivery failed" ping. The point is
 * that this message alone is enough to recover the enquiry and reply to it,
 * without anyone having to reach a log console in time.
 *
 * `{ "text": ... }` is the shape Slack incoming webhooks take and the one
 * Teams' connectors accept, so either works with no code change.
 *
 * Never throws and never blocks the caller's response: a broken webhook must
 * not turn a delivery problem into a 500 for the person filling in the form.
 */
async function alertDeliveryFailure(
  lead: LeadInput,
  meta: LeadMeta,
  why: string
): Promise<void> {
  const hook = process.env.LEAD_ALERT_WEBHOOK;
  if (!hook) return;

  const text = [
    `:rotating_light: Aegis Ascent — a consultation request was NOT delivered.`,
    `Reason: ${why}`,
    "",
    `Name:    ${lead.firstName} ${lead.lastName}`.trim(),
    `Email:   ${lead.workEmail}`,
    `Company: ${companyOrFallback(lead)}`,
    `Phone:   ${lead.phone || "—"}`,
    "",
    lead.needs || "(no message)",
    "",
    `Submitted ${meta.submitted} from ${meta.page}`,
    "Reply to this person directly — the record did not reach the CRM.",
  ].join("\n");

  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`webhook responded ${res.status}`);
    console.info("[lead] delivery-failure alert sent.");
  } catch (err) {
    console.error(`[lead] ALERT WEBHOOK FAILED (${String(err)}).`);
  }
}

/**
 * Last line of defence for a lead Zoho would not take. A lead must never be
 * lost to a mapping error, so if this cannot send either, it logs the whole
 * submission at error level -- recoverable from the logs by hand.
 */
async function emailFallback(
  lead: LeadInput,
  meta: LeadMeta,
  why: string
): Promise<void> {
  const to = process.env.LEAD_FALLBACK_EMAIL ?? "contact@aegisascent.com";
  const interests = parseInterests(lead.primaryInterest)
    .map((slug) => labelFor(PRIMARY_INTERESTS, slug))
    .join(", ");
  const body = [
    `Consultation request (Zoho forward did not succeed: ${why})`,
    "",
    `Name:              ${lead.firstName} ${lead.lastName}`.trim(),
    `Work email:        ${lead.workEmail}`,
    `Company:           ${companyOrFallback(lead)}`,
    `Phone:             ${lead.phone || "—"}`,
    `Preferred contact: ${lead.preferredContact}`,
    `Industry:          ${labelFor(INDUSTRIES, lead.industry) || "—"}`,
    `Company size:      ${labelFor(COMPANY_SIZES, lead.companySize) || "—"}`,
    `Primary interest:  ${interests || "—"}`,
    `Package:           ${labelFor(ENGAGEMENT_PACKAGES, lead.engagementPackage) || "—"}`,
    `Timeline:          ${labelFor(TIMELINES, lead.timeline) || "—"}`,
    `Heard about us:    ${labelFor(HEARD_ABOUT, lead.heardAbout) || "—"}`,
    "",
    "Anything else we should know:",
    lead.needs || "—",
    "",
    "Submission metadata:",
    `ip: ${meta.ip}`,
    `page: ${meta.page}`,
    `submitted: ${meta.submitted}`,
  ].join("\n");

  /*
   * Resend. The endpoint defaults so only the key and the From address have
   * to be configured, but it stays overridable -- a different provider, or
   * Resend's EU endpoint, needs no code change.
   *
   * `from` has no default on purpose. Resend rejects any sender on a domain
   * that is not verified in the account, and a hardcoded guess would fail
   * every send for a reason the log would not make obvious.
   */
  const endpoint = process.env.LEAD_EMAIL_ENDPOINT ?? "https://api.resend.com/emails";
  const apiKey = process.env.LEAD_EMAIL_API_KEY;
  const from = process.env.LEAD_EMAIL_FROM;

  if (!apiKey || !from) {
    const missing = [
      !apiKey && "LEAD_EMAIL_API_KEY",
      !from && "LEAD_EMAIL_FROM",
    ]
      .filter(Boolean)
      .join(", ");
    console.error(
      `[lead] FALLBACK EMAIL NOT CONFIGURED (missing ${missing}) — ` +
        `lead preserved in logs only.\nTo: ${to}\n${body}`
    );
    return;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        // Resend takes an array; a bare string is accepted but the array form
        // is what lets LEAD_FALLBACK_EMAIL hold a comma-separated list later.
        to: to.split(",").map((address) => address.trim()).filter(Boolean),
        reply_to: lead.workEmail,
        subject: `Consultation request — ${companyOrFallback(lead)}`,
        text: body,
      }),
    });
    if (!res.ok) {
      // Resend explains itself in the body; without it the log says only
      // "422" and the cause (unverified domain, bad From) stays hidden.
      const detail = await res.text().catch(() => "");
      throw new Error(`Resend responded ${res.status}${detail ? `: ${detail.slice(0, 300)}` : ""}`);
    }
    console.info("[lead] fallback email sent via Resend.");
  } catch (err) {
    console.error(
      `[lead] FALLBACK EMAIL FAILED (${String(err)}) — lead preserved in logs.\n` +
        `To: ${to}\n${body}`
    );
  }
}

export async function POST(req: Request) {
  const ip = clientIp(req);

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again in a few minutes." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Malformed request." },
      { status: 400 }
    );
  }

  // Only known fields survive; anything else a bot appends is dropped.
  const lead: LeadInput = { ...EMPTY_LEAD };
  for (const key of Object.keys(EMPTY_LEAD) as (keyof LeadInput)[]) {
    const value = body[key];
    lead[key] = typeof value === "string" ? value : "";
  }

  // Honeypot. Answer exactly as a success looks so a bot learns nothing
  // from the difference, but forward nothing.
  if (lead.website.trim()) {
    console.info(`[lead] honeypot tripped from ${ip} — dropped.`);
    return NextResponse.json({ ok: true });
  }

  const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  const turnstile = await verifyTurnstile(token, ip);
  if (!turnstile.ok) {
    console.warn(`[lead] Turnstile rejected a submission from ${ip}: ${turnstile.reason}`);
    return NextResponse.json(
      { ok: false, error: "Verification failed. Please try again." },
      { status: 400 }
    );
  }

  const errors = validateLead(lead);
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const meta: LeadMeta = {
    ip,
    ua: req.headers.get("user-agent") ?? "",
    page: typeof body.page === "string" ? body.page : req.headers.get("referer") ?? "",
    turnstileHostname: turnstile.hostname,
    turnstileAction: turnstile.action || TURNSTILE_ACTION,
    submitted: new Date().toISOString(),
  };

  const forwarded = await forwardToZoho(lead, meta);
  // Log the outcome either way. Success was previously silent, which left no
  // way to tell a delivered lead from a dropped one without reading the Zoho
  // list -- and WebToLead answers 200 regardless, so this line means "posted
  // and accepted", not "record created". The payload above is what to compare
  // against the Leads list if one goes missing.
  if (forwarded.ok) {
    console.info(`[lead] Zoho forward: ${forwarded.detail}.`);
  } else {
    console.error(`[lead] Zoho forward FAILED (${forwarded.detail}) — falling back.`);
    await emailFallback(lead, meta, forwarded.detail);
    await alertDeliveryFailure(lead, meta, forwarded.detail);
  }

  // Success either way: a lead that reached us is not the sender's problem
  // to retry, and a mapping error must never look like a failure to them.
  return NextResponse.json({ ok: true });
}
