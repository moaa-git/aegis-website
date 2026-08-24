/**
 * Consultation form field definitions and validation.
 *
 * Client-safe on purpose: option labels and values are rendered into the
 * form anyway, so there is nothing to hide here. Everything Zoho-specific —
 * endpoint, form id, field names, per-option Zoho values — lives in
 * src/lib/zoho-mapping.ts, which is server-only.
 *
 * Both the modal and the route handler import this module, so a field can
 * never be validated one way on the client and another on the server.
 */

export type Option = { value: string; label: string };

export const INDUSTRIES: Option[] = [
  { value: "legal", label: "Legal" },
  { value: "financial-services", label: "Financial Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "agriculture", label: "Agriculture" },
  { value: "manufacturing", label: "Manufacturing / Light Industrial" },
  { value: "professional-services", label: "Professional Services" },
  { value: "other", label: "Other" },
];

export const COMPANY_SIZES: Option[] = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-plus", label: "201+" },
];

export const PRIMARY_INTERESTS: Option[] = [
  { value: "endpoint-security", label: "Endpoint & Security" },
  { value: "compliance-legal", label: "Compliance & Legal" },
  { value: "ai-modern-work", label: "AI & Modern Work" },
  { value: "infrastructure-network", label: "Infrastructure & Network" },
  { value: "not-sure", label: "Not sure yet" },
];

export const ENGAGEMENT_PACKAGES: Option[] = [
  { value: "secure-in-a-day", label: "Secure in a Day" },
  { value: "law-firm-compliance", label: "Law Firm Compliance" },
  { value: "regulatory-readiness", label: "Regulatory Readiness" },
  { value: "full-stack-deployment", label: "Full Stack Deployment" },
  { value: "not-sure", label: "Not sure, recommend one" },
];

export const TIMELINES: Option[] = [
  { value: "immediate", label: "Immediate (under 30 days)" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-6-months", label: "3–6 months" },
  { value: "exploring", label: "Just exploring" },
];

export const HEARD_ABOUT: Option[] = [
  { value: "referral", label: "Referral" },
  { value: "web-search", label: "Web search" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "event", label: "Event" },
  { value: "sophos-microsoft", label: "Sophos or Microsoft" },
  { value: "other", label: "Other" },
];

export const CONTACT_PREFERENCES: Option[] = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
];

/** Every select, in render order, with its option list. */
export const SELECTS = [
  { name: "industry", label: "Industry", options: INDUSTRIES },
  { name: "companySize", label: "Company size", options: COMPANY_SIZES },
  { name: "primaryInterest", label: "Primary interest", options: PRIMARY_INTERESTS },
  { name: "engagementPackage", label: "Engagement package", options: ENGAGEMENT_PACKAGES },
  { name: "timeline", label: "Timeline", options: TIMELINES },
  { name: "heardAbout", label: "How did you hear about us", options: HEARD_ABOUT },
] as const;

export type SelectName = (typeof SELECTS)[number]["name"];

export type LeadInput = {
  fullName: string;
  workEmail: string;
  company: string;
  needs: string;
  phone: string;
  industry: string;
  companySize: string;
  primaryInterest: string;
  engagementPackage: string;
  timeline: string;
  heardAbout: string;
  preferredContact: string;
  /** Honeypot. Must arrive empty; a real user never sees this field. */
  website: string;
};

export const EMPTY_LEAD: LeadInput = {
  fullName: "",
  workEmail: "",
  company: "",
  needs: "",
  phone: "",
  industry: "",
  companySize: "",
  primaryInterest: "",
  engagementPackage: "",
  timeline: "",
  heardAbout: "",
  preferredContact: "email",
  website: "",
};

export type LeadErrors = Partial<Record<keyof LeadInput, string>>;

const MAX = {
  fullName: 120,
  workEmail: 200,
  company: 160,
  needs: 4000,
  phone: 40,
};

/**
 * Deliberately permissive: one dot-separated domain, no attempt to police
 * TLDs or plus-addressing. Rejecting a valid address costs a lead; letting
 * a malformed one through costs a bounce.
 */
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

const isOption = (options: Option[], value: string) =>
  value === "" || options.some((o) => o.value === value);

export function validateLead(input: LeadInput): LeadErrors {
  const errors: LeadErrors = {};
  const trim = (s: string) => (typeof s === "string" ? s.trim() : "");

  if (!trim(input.fullName)) errors.fullName = "Enter your name.";
  else if (input.fullName.length > MAX.fullName)
    errors.fullName = `Keep this under ${MAX.fullName} characters.`;

  const email = trim(input.workEmail);
  if (!email) errors.workEmail = "Enter your work email.";
  else if (!EMAIL.test(email)) errors.workEmail = "That does not look like an email address.";
  else if (email.length > MAX.workEmail)
    errors.workEmail = `Keep this under ${MAX.workEmail} characters.`;

  if (!trim(input.company)) errors.company = "Enter your company or firm name.";
  else if (input.company.length > MAX.company)
    errors.company = `Keep this under ${MAX.company} characters.`;

  if (!trim(input.needs)) errors.needs = "Tell us briefly what you need.";
  else if (input.needs.length > MAX.needs)
    errors.needs = `Keep this under ${MAX.needs} characters.`;

  if (trim(input.phone) && input.phone.length > MAX.phone)
    errors.phone = `Keep this under ${MAX.phone} characters.`;

  // Not in the brief's schema, but asking to be called back without leaving
  // a number is a dead lead, so it is caught at the form rather than in the
  // inbox. Logged in docs/DEVIATIONS.md.
  if (input.preferredContact === "phone" && !trim(input.phone))
    errors.phone = "Add a phone number, or switch preferred contact to email.";

  if (!isOption(INDUSTRIES, input.industry)) errors.industry = "Choose from the list.";
  if (!isOption(COMPANY_SIZES, input.companySize)) errors.companySize = "Choose from the list.";
  if (!isOption(PRIMARY_INTERESTS, input.primaryInterest))
    errors.primaryInterest = "Choose from the list.";
  if (!isOption(ENGAGEMENT_PACKAGES, input.engagementPackage))
    errors.engagementPackage = "Choose from the list.";
  if (!isOption(TIMELINES, input.timeline)) errors.timeline = "Choose from the list.";
  if (!isOption(HEARD_ABOUT, input.heardAbout)) errors.heardAbout = "Choose from the list.";
  if (!isOption(CONTACT_PREFERENCES, input.preferredContact) || !input.preferredContact)
    errors.preferredContact = "Choose how you would like to be contacted.";

  return errors;
}

export const labelFor = (options: Option[], value: string) =>
  options.find((o) => o.value === value)?.label ?? "";
