/**
 * Zoho CRM WebToLead wiring. SERVER ONLY.
 *
 * This is the one file to edit when Zoho's field names change. Nothing here
 * may be imported from a client component: the endpoint, the form ids and the
 * field names must never appear in page source. That is the whole reason the
 * old static site's form was replaced — it posted straight to Zoho from the
 * browser, so every bot on the internet could read the field names off the
 * page and stuff the lead inbox.
 *
 * Everything below is inert until the environment supplies credentials. With
 * ZOHO_ENABLED unset the route logs the mapped payload and takes the email
 * fallback path instead of forwarding.
 *
 * BLOCKED (docs/ZOHO-FIELD-MAP.md): the regenerated webform HTML has not been
 * supplied, so no `LEADCF*` slot number and no picklist option string is
 * known. Nothing here guesses one. A picklist mismatch does not error in
 * Zoho — the field simply lands empty — so a guessed string is strictly worse
 * than an unwired field, because it fails silently and looks like it worked.
 * Answers that cannot be posted to their own field are carried in the
 * Description appendix instead, so no answer is lost while the block stands.
 */

if (typeof window !== "undefined") {
  throw new Error(
    "zoho-mapping.ts is server-only and must not be imported from a client component."
  );
}

import {
  COMPANY_SIZES,
  ENGAGEMENT_PACKAGES,
  HEARD_ABOUT,
  INDUSTRIES,
  PRIMARY_INTERESTS,
  TIMELINES,
  CONTACT_PREFERENCES,
  labelFor,
  parseInterests,
  type LeadInput,
  type Option,
} from "./consultation-fields";

export const zohoConfig = {
  /**
   * The form action URL is datacenter-specific and comes out of the generated
   * webform HTML. The default is the .com datacenter; a .eu/.in/.com.au
   * account will not accept it.
   */
  endpoint:
    process.env.ZOHO_WEBTOLEAD_ENDPOINT ??
    "https://crm.zoho.com/crm/WebToLeadForm",
  /** Zoho's per-form identifier (`xnQsjsdp`). */
  formId: process.env.ZOHO_FORM_ID ?? "",
  /** Zoho's per-form digest (`xmIwtLD`). */
  digest: process.env.ZOHO_FORM_DIGEST ?? "",
  /** Zoho's `actionType`, base64 in the generated form. */
  actionType: process.env.ZOHO_ACTION_TYPE ?? "",
  /** Nothing is forwarded until this is explicitly turned on. */
  enabled: process.env.ZOHO_ENABLED === "true",
} as const;

/**
 * A slot the regenerated webform has not yet supplied. Kept as an explicit
 * sentinel rather than an omission so the pending set is enumerable — the
 * payload builder uses it to decide what goes in the Description appendix.
 */
const PENDING = null;

/**
 * Our field name -> Zoho's field name.
 *
 * Standard field names are Zoho's literal labels, spaces included, and are
 * already correct. The five custom fields are `LEADCF*` slots whose numbers
 * only exist in the generated webform — blocker 1.
 */
export const fieldMap: Record<keyof LeadInput, string | null> = {
  firstName: "First Name",
  lastName: "Last Name",
  workEmail: "Email",
  company: "Company",
  needs: "Description",
  phone: "Phone",
  industry: "Industry",
  // "No of Employees" with no period. Zoho's *label* reads "No. of
  // Employees" but the form field name has no period, and a mismatched
  // key is discarded without an error. Taken from the webform export.
  companySize: "No of Employees",
  primaryInterest: "LEADCF1", // Service Interest — Multi Pick List
  engagementPackage: PENDING, // no Zoho field — see the note in valueMap
  timeline: "LEADCF3", // Timeline — Pick List
  heardAbout: "Lead Source",
  preferredContact: "LEADCF4", // Preferred contact — Pick List
  // Never forwarded: the honeypot exists only to be checked and dropped.
  website: null,
};

/** The sixth Zoho field, function-populated with no visible control. */
export const METADATA_FIELD: string | null = "LEADCF2"; // Submission Metadata — Multi Line

/**
 * Our option slugs -> the exact picklist strings Zoho expects.
 *
 * Zoho matches character for character, case included, and a mismatch lands
 * the field empty without erroring. Only sets confirmed against the CRM
 * appear here; a set left `PENDING` is one whose strings have not been copied
 * out of Zoho yet — blocker 2.
 *
 * Watch the traps when filling these in. `Copilot/AI Readiness` and
 * `Not Sure Yet/Other` have no spaces around the slash; `eDiscovery / Legal
 * Hold` does. The display labels in consultation-fields.ts differ from these
 * strings deliberately — in slash spacing, and in case for the "not sure"
 * escape hatch — and are NOT the contract. Do not "fix" one to match the
 * other; the strings here are what Zoho stores, the labels there are what
 * reads well, and they are allowed to disagree.
 */
export const valueMap: Record<string, Record<string, string> | null> = {
  industry: {
    "legal-services": "Legal Services",
    "accounting-finance": "Accounting & Finance",
    "healthcare-dental": "Healthcare & Dental",
    insurance: "Insurance",
    "real-estate": "Real Estate",
    manufacturing: "Manufacturing",
    "construction-trades": "Construction & Trades",
    agriculture: "Agriculture",
    "professional-services": "Professional Services",
    nonprofit: "Nonprofit",
    "government-municipal": "Government / Municipal",
    education: "Education",
    other: "Other",
  },
  companySize: {
    // Band low-end integers for the standard Number field. Digits only — a
    // `+` or a comma is rejected. Recorded in the Zoho field description so a
    // lead showing exactly 26 is not misread later as a precise headcount.
    "1-10": "1",
    "11-25": "11",
    "26-50": "26",
    "51-100": "51",
    "100-plus": "100",
  },
  primaryInterest: {
    "m365-security-review": "M365 Security Review",
    "copilot-ai-readiness": "Copilot/AI Readiness",
    "ediscovery-legal-hold": "eDiscovery / Legal Hold",
    "sophos-endpoint-mdr": "Sophos Endpoint & MDR",
    "m365-migration": "M365 Migration",
    // Added 2026-08-26 at the user's request. NOT in the option set copied out
    // of Zoho — the matching picklist option must be created there with this
    // exact string, or the token is dropped silently on arrival.
    "infrastructure-networking": "Infrastructure & Networking",
    "general-consulting": "General Consulting",
    "not-sure": "Not Sure Yet/Other",
  },
  /*
   * No Zoho field exists for this. "Service Interest" (LEADCF1) holds the
   * primary-interest list, not the packages, so the two are not the same
   * picklist despite the similar name. Until a field is created, the answer
   * rides in the Description appendix rather than being mapped somewhere it
   * does not belong.
   */
  engagementPackage: PENDING,
  timeline: {
    immediate: "Immediate",
    // En-dash, not a hyphen. Copied from the webform export, which is CP1252
    // despite declaring UTF-8; retyping these with "-" fails silently.
    "1-3-months": "1–3 months",
    "3-6-months": "3–6 months",
    exploring: "Just exploring",
  },
  heardAbout: {
    "web-search": "Web Search",
    "referral-client": "Referral – Client",
    "referral-partner": "Referral – Partner",
    linkedin: "LinkedIn",
    "event-seminar": "Event / Seminar",
    "sophos-pax8": "Sophos / Pax8",
    "microsoft-partner-network": "Microsoft Partner Network",
    "direct-outreach": "Direct Outreach",
    other: "Other",
  },
  preferredContact: {
    phone: "Phone",
    email: "Email",
  },
};

/** Site-side option lists, for rendering an unmappable answer by its label. */
const OPTIONS: Partial<Record<keyof LeadInput, Option[]>> = {
  industry: INDUSTRIES,
  companySize: COMPANY_SIZES,
  primaryInterest: PRIMARY_INTERESTS,
  engagementPackage: ENGAGEMENT_PACKAGES,
  timeline: TIMELINES,
  heardAbout: HEARD_ABOUT,
  preferredContact: CONTACT_PREFERENCES,
};

/** Human names for the Description appendix, in a sensible reading order. */
const APPENDIX_LABELS: Partial<Record<keyof LeadInput, string>> = {
  primaryInterest: "Primary interest",
  engagementPackage: "Engagement package",
  timeline: "Timeline",
  industry: "Industry",
  heardAbout: "How they heard about us",
  preferredContact: "Preferred contact",
};

/** Submission context, gathered by the route rather than by the form. */
export type LeadMeta = {
  ip: string;
  ua: string;
  page: string;
  turnstileHostname: string;
  turnstileAction: string;
  submitted: string;
};

/**
 * `Company` is mandatory on Leads, so a submission that somehow arrives
 * without one must be substituted rather than dropped by Zoho. Preference
 * order: the email's domain, then the literal `Website Inquiry`.
 */
export function companyOrFallback(lead: LeadInput): string {
  const company = lead.company.trim();
  if (company) return company;
  const domain = lead.workEmail.trim().split("@")[1]?.trim();
  return domain || "Website Inquiry";
}

/**
 * Newline-delimited `key: value`. One Multi Line field instead of four
 * separate ones, to conserve the module's ten custom-field slots.
 *
 * This is audit data: it is deliberately not mirrored to Contacts, Accounts
 * or Deals, and — while the slot is pending — deliberately not folded into
 * Description either, since Description auto-maps on conversion and would
 * carry an IP address along with it.
 */
export function packMetadata(meta: LeadMeta): string {
  return [
    `ip: ${meta.ip}`,
    `ua: ${meta.ua}`,
    `page: ${meta.page}`,
    `turnstile_hostname: ${meta.turnstileHostname}`,
    `turnstile_action: ${meta.turnstileAction}`,
    `submitted: ${meta.submitted}`,
  ].join("\n");
}

/** The Zoho string for one answer, or null if that set is still pending. */
function zohoValue(key: keyof LeadInput, slug: string): string | null {
  const map = valueMap[key];
  if (map === undefined) return slug; // free text: no translation needed
  if (map === PENDING) return null;
  return map[slug] ?? null;
}

/** Multi-select: semicolon-joined, no spaces around the delimiter. */
function interestValue(lead: LeadInput): string {
  return parseInterests(lead.primaryInterest)
    .map((slug) => zohoValue("primaryInterest", slug))
    .filter((v): v is string => Boolean(v))
    .join(";");
}

export type MappedLead = {
  /** Exactly what would be POSTed, ready to log. */
  payload: Record<string, string>;
  /** Answers no field could take yet, already folded into Description. */
  pending: string[];
  /** Packed submission metadata, held back while its slot is unknown. */
  metadata: string;
};

/** Turns a validated lead into the exact body Zoho would receive. */
export function toZohoPayload(lead: LeadInput, meta: LeadMeta): MappedLead {
  const payload: Record<string, string> = {};
  const pending: string[] = [];

  if (zohoConfig.formId) payload.xnQsjsdp = zohoConfig.formId;
  if (zohoConfig.digest) payload.xmIwtLD = zohoConfig.digest;
  if (zohoConfig.actionType) payload.actionType = zohoConfig.actionType;

  const record = (key: keyof LeadInput, value: string) => {
    const field = fieldMap[key];
    const mapped =
      key === "primaryInterest" ? interestValue(lead) : zohoValue(key, value);

    if (field && mapped) {
      payload[field] = mapped;
      return;
    }
    // Either the slot number or the option strings are still unknown. Record
    // it for the appendix using the site's own labels, which are at least
    // readable by a human at triage.
    const options = OPTIONS[key];
    const readable = options
      ? key === "primaryInterest"
        ? parseInterests(value)
            .map((slug) => labelFor(options, slug))
            .join("; ")
        : labelFor(options, value)
      : value;
    const name = APPENDIX_LABELS[key] ?? key;
    if (readable) pending.push(`${name}: ${readable}`);
  };

  for (const key of Object.keys(fieldMap) as (keyof LeadInput)[]) {
    if (key === "website") continue; // honeypot, never forwarded
    if (key === "company" || key === "needs") continue; // handled below
    const raw = lead[key].trim();
    if (!raw) continue; // omit entirely — never send an empty or a zero
    record(key, raw);
  }

  payload.Company = companyOrFallback(lead);

  // Description carries the prospect's own prose, plus — only while slots are
  // pending — the answers that had nowhere else to go.
  const description = [
    lead.needs.trim(),
    pending.length
      ? [
          "— Submitted selections (not yet mapped to Zoho fields) —",
          ...pending,
        ].join("\n")
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  if (description) payload[fieldMap.needs as string] = description;

  const metadata = packMetadata(meta);
  if (METADATA_FIELD) payload[METADATA_FIELD] = metadata;

  return { payload, pending, metadata };
}
