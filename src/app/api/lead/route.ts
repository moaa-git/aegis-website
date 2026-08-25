import { NextResponse } from "next/server";
import {
  EMPTY_LEAD,
  validateLead,
  type LeadInput,
} from "@/lib/consultation-fields";
import { toZohoPayload, zohoConfig } from "@/lib/zoho-mapping";

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
 * Cloudflare Turnstile. With no secret configured, verification is skipped
 * and a warning is logged -- the form stays usable in local development
 * rather than failing closed on a box that has no keys. In production the
 * secret must be set; an unset secret there is a misconfiguration, and the
 * warning is the signal.
 */
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn(
      "[lead] TURNSTILE_SECRET_KEY not set — skipping bot verification. " +
        "Do not run production this way."
    );
    return true;
  }
  if (!token) return false;

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      }
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    // A Cloudflare outage must not take the form down with it.
    console.error("[lead] Turnstile verification failed to complete:", err);
    return true;
  }
}

async function forwardToZoho(
  lead: LeadInput
): Promise<{ ok: boolean; detail: string }> {
  const payload = toZohoPayload(lead);

  if (!zohoConfig.enabled) {
    console.info(
      "[lead] Zoho forward is STUBBED (ZOHO_ENABLED is not \"true\"). " +
        "Payload that would have been sent:\n" +
        JSON.stringify(payload, null, 2)
    );
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
 * Last line of defence for a lead Zoho would not take. A lead must never be
 * lost to a mapping error, so if this cannot send either, it logs the whole
 * submission at error level -- recoverable from the logs by hand.
 */
async function emailFallback(lead: LeadInput, why: string): Promise<void> {
  const to = process.env.LEAD_FALLBACK_EMAIL ?? "contact@aegisascent.com";
  const body = [
    `Consultation request (Zoho forward did not succeed: ${why})`,
    "",
    `Name:              ${lead.fullName}`,
    `Work email:        ${lead.workEmail}`,
    `Company:           ${lead.company}`,
    `Phone:             ${lead.phone || "—"}`,
    `Preferred contact: ${lead.preferredContact}`,
    `Industry:          ${lead.industry || "—"}`,
    `Company size:      ${lead.companySize || "—"}`,
    `Primary interest:  ${lead.primaryInterest || "—"}`,
    `Package:           ${lead.engagementPackage || "—"}`,
    `Timeline:          ${lead.timeline || "—"}`,
    `Heard about us:    ${lead.heardAbout || "—"}`,
    "",
    "What they need:",
    lead.needs,
  ].join("\n");

  const endpoint = process.env.LEAD_EMAIL_ENDPOINT;
  const apiKey = process.env.LEAD_EMAIL_API_KEY;

  if (!endpoint || !apiKey) {
    console.error(
      `[lead] FALLBACK EMAIL NOT CONFIGURED — lead preserved in logs only.\n` +
        `To: ${to}\n${body}`
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
        to,
        subject: `Consultation request — ${lead.company || lead.fullName}`,
        text: body,
      }),
    });
    if (!res.ok) throw new Error(`mailer responded ${res.status}`);
    console.info("[lead] fallback email sent.");
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
  if (!(await verifyTurnstile(token, ip))) {
    return NextResponse.json(
      { ok: false, error: "Verification failed. Please try again." },
      { status: 400 }
    );
  }

  const errors = validateLead(lead);
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const forwarded = await forwardToZoho(lead);
  if (!forwarded.ok) await emailFallback(lead, forwarded.detail);

  // Success either way: a lead that reached us is not the sender's problem
  // to retry, and a mapping error must never look like a failure to them.
  return NextResponse.json({ ok: true });
}
