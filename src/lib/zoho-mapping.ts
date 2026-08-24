/**
 * Zoho CRM WebToLead wiring. SERVER ONLY.
 *
 * This is the one file to edit when Zoho's field names change. Nothing here
 * may be imported from a client component: the endpoint, the form id and the
 * field names must never appear in page source. That is the whole reason the
 * old static site's form was replaced — it posted straight to Zoho from the
 * browser, so every bot on the internet could read the field names off the
 * page and stuff the lead inbox.
 *
 * Everything below is inert until the environment supplies credentials. With
 * ZOHO_ENABLED unset the route logs the mapped payload and takes the email
 * fallback path instead of forwarding.
 */

if (typeof window !== "undefined") {
  throw new Error(
    "zoho-mapping.ts is server-only and must not be imported from a client component."
  );
}

import type { LeadInput } from "./consultation-fields";

export const zohoConfig = {
  /** Standard Zoho WebToLead endpoint. */
  endpoint:
    process.env.ZOHO_WEBTOLEAD_ENDPOINT ??
    "https://crm.zoho.com/crm/WebToLeadForm",
  /** Zoho's per-form identifier ("xnQsjsdp" style value). */
  formId: process.env.ZOHO_FORM_ID ?? "",
  /** Zoho's per-form digest ("actionType"/"xmIwtLD" style value). */
  actionType: process.env.ZOHO_ACTION_TYPE ?? "",
  /** Owner/lead-source defaults applied to every submission. */
  leadSource: process.env.ZOHO_LEAD_SOURCE ?? "Website — Consultation Form",
  /** Nothing is forwarded until this is explicitly turned on. */
  enabled: process.env.ZOHO_ENABLED === "true",
} as const;

/**
 * Our field name -> Zoho's field name.
 *
 * The custom-field slots (LEADCF*) are placeholders until the real form is
 * generated in Zoho; the standard fields are Zoho's documented names and
 * are already correct. Changing any of this is a one-line edit here.
 */
export const fieldMap: Record<keyof LeadInput, string | null> = {
  fullName: "Last Name",
  workEmail: "Email",
  company: "Company",
  needs: "Description",
  phone: "Phone",
  industry: "Industry",
  companySize: "No of Employees",
  primaryInterest: "LEADCF1",
  engagementPackage: "LEADCF2",
  timeline: "LEADCF3",
  heardAbout: "Lead Source Detail",
  preferredContact: "LEADCF4",
  // Never forwarded: the honeypot exists only to be checked and dropped.
  website: null,
};

/**
 * Our option slugs -> the exact picklist strings Zoho expects. Zoho rejects
 * a picklist value it does not know, so these must match the CRM's picklist
 * definitions character for character once the real form exists.
 */
export const valueMap: Partial<Record<keyof LeadInput, Record<string, string>>> = {
  industry: {
    legal: "Legal",
    "financial-services": "Financial Services",
    healthcare: "Healthcare",
    agriculture: "Agriculture",
    manufacturing: "Manufacturing / Light Industrial",
    "professional-services": "Professional Services",
    other: "Other",
  },
  companySize: {
    "1-10": "1-10",
    "11-50": "11-50",
    "51-200": "51-200",
    "201-plus": "201+",
  },
  primaryInterest: {
    "endpoint-security": "Endpoint & Security",
    "compliance-legal": "Compliance & Legal",
    "ai-modern-work": "AI & Modern Work",
    "infrastructure-network": "Infrastructure & Network",
    "not-sure": "Not sure yet",
  },
  engagementPackage: {
    "secure-in-a-day": "Secure in a Day",
    "law-firm-compliance": "Law Firm Compliance",
    "regulatory-readiness": "Regulatory Readiness",
    "full-stack-deployment": "Full Stack Deployment",
    "not-sure": "Not sure, recommend one",
  },
  timeline: {
    immediate: "Immediate (under 30 days)",
    "1-3-months": "1-3 months",
    "3-6-months": "3-6 months",
    exploring: "Just exploring",
  },
  heardAbout: {
    referral: "Referral",
    "web-search": "Web search",
    linkedin: "LinkedIn",
    event: "Event",
    "sophos-microsoft": "Sophos or Microsoft",
    other: "Other",
  },
  preferredContact: {
    email: "Email",
    phone: "Phone",
  },
};

/** Turns a validated lead into the exact body Zoho would receive. */
export function toZohoPayload(lead: LeadInput): Record<string, string> {
  const payload: Record<string, string> = {};

  if (zohoConfig.formId) payload.xnQsjsdp = zohoConfig.formId;
  if (zohoConfig.actionType) payload.actionType = zohoConfig.actionType;
  payload["Lead Source"] = zohoConfig.leadSource;

  for (const [key, zohoField] of Object.entries(fieldMap) as [
    keyof LeadInput,
    string | null,
  ][]) {
    if (!zohoField) continue;
    const raw = (lead[key] ?? "").trim();
    if (!raw) continue;
    payload[zohoField] = valueMap[key]?.[raw] ?? raw;
  }

  return payload;
}
