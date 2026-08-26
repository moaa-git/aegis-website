/**
 * Consultation form field definitions and validation.
 *
 * Client-safe on purpose: option labels and slugs are rendered into the form
 * anyway, so there is nothing to hide here. Everything Zoho-specific — the
 * endpoint, the form ids, the field names, the exact picklist strings — lives
 * in src/lib/zoho-mapping.ts, which is server-only.
 *
 * Both the modal and the route handler import this module, so a field can
 * never be validated one way on the client and another on the server.
 *
 * Option slugs here are OURS. They are deliberately not Zoho's picklist
 * strings: the whole point of the server-side forward is that Zoho's field
 * names and option strings never appear in page source. docs/ZOHO-FIELD-MAP.md
 * is the contract; zoho-mapping.ts is where a slug becomes a Zoho string.
 */

export type Option = { value: string; label: string };

/**
 * Casing rule for option labels, so this stops drifting:
 *
 *   - An option that NAMES something is Title Case — a service, an industry,
 *     a package, a channel. "M365 Security Review", "Financial Services",
 *     "Web Search", "Sophos or Microsoft" (Title Case keeps conjunctions
 *     lowercase).
 *   - An option that is a PHRASE THE USER IS SAYING is sentence case.
 *     "Not sure yet / other", "Not sure, recommend one", "Just exploring",
 *     "Immediate (under 30 days)". Title-casing these reads as shouting.
 *
 * Field labels are sentence case throughout, without exception — that is the
 * normal convention for form labels and is why "Company or firm name" has a
 * lowercase "firm".
 */

/**
 * Blocked on the regenerated webform (docs/ZOHO-FIELD-MAP.md, blocker 2) —
 * these are the site's own list, replacing Zoho's legacy telecom/hardware
 * defaults with the Central Illinois market list. The Zoho strings they map
 * to are not yet known.
 */
export const INDUSTRIES: Option[] = [
  { value: "legal", label: "Legal" },
  { value: "financial-services", label: "Financial Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "agriculture", label: "Agriculture" },
  { value: "manufacturing", label: "Manufacturing / Light Industrial" },
  { value: "professional-services", label: "Professional Services" },
  { value: "other", label: "Other" },
];

/**
 * Bands display; the band's low-end integer posts to the standard
 * `No. of Employees` Number field. Lossless — each posted value identifies
 * exactly one band. The en dashes are display only, which is what keeps the
 * dash trap in the field map from biting here.
 */
export const COMPANY_SIZES: Option[] = [
  { value: "1-10", label: "1–10" },
  { value: "11-25", label: "11–25" },
  { value: "26-50", label: "26–50" },
  { value: "51-100", label: "51–100" },
  { value: "100-plus", label: "100+" },
];

/**
 * The one confirmed option set. Multi-select: posts as a semicolon-joined
 * string with no spaces around the delimiter, so Zoho matches each token
 * independently and one bad token drops only itself.
 */
export const PRIMARY_INTERESTS: Option[] = [
  { value: "m365-security-review", label: "M365 Security Review" },
  { value: "copilot-ai-readiness", label: "Copilot / AI Readiness" },
  { value: "ediscovery-legal-hold", label: "eDiscovery / Legal Hold" },
  { value: "sophos-endpoint-mdr", label: "Sophos Endpoint & MDR" },
  { value: "m365-migration", label: "M365 Migration" },
  { value: "infrastructure-networking", label: "Infrastructure & Networking" },
  { value: "general-consulting", label: "General Consulting" },
  { value: "not-sure", label: "Not sure yet / other" },
];

/**
 * The one interest that clears every other selection, and is cleared by any
 * other selection. Without this you get records tagged both "M365 Migration"
 * and "not sure yet", which is meaningless at triage.
 */
export const EXCLUSIVE_INTEREST = "not-sure";

/** Blocked on the regenerated webform — see INDUSTRIES. */
export const ENGAGEMENT_PACKAGES: Option[] = [
  { value: "secure-in-a-day", label: "Secure in a Day" },
  { value: "law-firm-compliance", label: "Law Firm Compliance" },
  { value: "regulatory-readiness", label: "Regulatory Readiness" },
  { value: "full-stack-deployment", label: "Full Stack Deployment" },
  { value: "not-sure", label: "Not sure, recommend one" },
];

/** Blocked on the regenerated webform — see INDUSTRIES. */
export const TIMELINES: Option[] = [
  { value: "immediate", label: "Immediate (under 30 days)" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-6-months", label: "3–6 months" },
  { value: "exploring", label: "Just exploring" },
];

/** Blocked on the regenerated webform — carries the Lead Source answer. */
export const HEARD_ABOUT: Option[] = [
  { value: "referral", label: "Referral" },
  { value: "web-search", label: "Web Search" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "event", label: "Event" },
  { value: "sophos-microsoft", label: "Sophos or Microsoft" },
  { value: "other", label: "Other" },
];

/** Blocked on the regenerated webform — see INDUSTRIES. */
export const CONTACT_PREFERENCES: Option[] = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
];

/** Every single-choice select, in render order, with its option list. */
export const SELECTS = [
  { name: "industry", label: "Industry", options: INDUSTRIES },
  { name: "companySize", label: "Company size", options: COMPANY_SIZES },
  { name: "engagementPackage", label: "Engagement package", options: ENGAGEMENT_PACKAGES },
  { name: "timeline", label: "Timeline", options: TIMELINES },
  { name: "heardAbout", label: "How did you hear about us", options: HEARD_ABOUT },
] as const;

export type SelectName = (typeof SELECTS)[number]["name"];

export type LeadInput = {
  firstName: string;
  lastName: string;
  workEmail: string;
  company: string;
  needs: string;
  phone: string;
  industry: string;
  companySize: string;
  /** Semicolon-joined slugs, no spaces around the delimiter. May be empty. */
  primaryInterest: string;
  engagementPackage: string;
  timeline: string;
  heardAbout: string;
  preferredContact: string;
  /** Honeypot. Must arrive empty; a real user never sees this field. */
  website: string;
};

export const EMPTY_LEAD: LeadInput = {
  firstName: "",
  lastName: "",
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
  firstName: 80,
  lastName: 80,
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

/** Splits the stored multi-select value into slugs. Empty in, empty out. */
export const parseInterests = (value: string): string[] =>
  value ? value.split(";").filter(Boolean) : [];

/** The inverse. No spaces around the delimiter — Zoho splits on `;` alone. */
export const joinInterests = (slugs: string[]): string => slugs.join(";");

/**
 * Toggles one interest, enforcing mutual exclusivity: picking "not sure yet"
 * clears everything else, and picking anything else clears "not sure yet".
 * Render order is preserved so the stored string does not depend on the order
 * the user happened to click in.
 */
export function toggleInterest(current: string, slug: string): string {
  const chosen = new Set(parseInterests(current));
  if (chosen.has(slug)) chosen.delete(slug);
  else if (slug === EXCLUSIVE_INTEREST) return EXCLUSIVE_INTEREST;
  else {
    chosen.delete(EXCLUSIVE_INTEREST);
    chosen.add(slug);
  }
  return joinInterests(
    PRIMARY_INTERESTS.filter((o) => chosen.has(o.value)).map((o) => o.value)
  );
}

export function validateLead(input: LeadInput): LeadErrors {
  const errors: LeadErrors = {};
  const trim = (s: string) => (typeof s === "string" ? s.trim() : "");

  // `Last Name` is a hard Zoho requirement — the record fails without it.
  // First name is required by the site only.
  if (!trim(input.firstName)) errors.firstName = "Enter your first name.";
  else if (input.firstName.length > MAX.firstName)
    errors.firstName = `Keep this under ${MAX.firstName} characters.`;

  if (!trim(input.lastName)) errors.lastName = "Enter your last name.";
  else if (input.lastName.length > MAX.lastName)
    errors.lastName = `Keep this under ${MAX.lastName} characters.`;

  const email = trim(input.workEmail);
  if (!email) errors.workEmail = "Enter your work email.";
  else if (!EMAIL.test(email)) errors.workEmail = "That does not look like an email address.";
  else if (email.length > MAX.workEmail)
    errors.workEmail = `Keep this under ${MAX.workEmail} characters.`;

  // Mandatory on Leads. The server substitutes rather than lose the record if
  // one ever arrives without it, but the form still asks.
  if (!trim(input.company)) errors.company = "Enter your company or firm name.";
  else if (input.company.length > MAX.company)
    errors.company = `Keep this under ${MAX.company} characters.`;

  // Optional by decision (2026-08-26): the friction is the asterisk, not the
  // field, and the prospect who picked a specific service is the one most
  // worth hearing from in prose.
  if (input.needs.length > MAX.needs)
    errors.needs = `Keep this under ${MAX.needs} characters.`;

  if (trim(input.phone) && input.phone.length > MAX.phone)
    errors.phone = `Keep this under ${MAX.phone} characters.`;

  // Not in the brief's schema, but asking to be called back without leaving
  // a number is a dead lead, so it is caught at the form rather than in the
  // inbox. Logged in docs/DEVIATIONS.md.
  if (input.preferredContact === "phone" && !trim(input.phone))
    errors.phone = "Add a phone number, or switch preferred contact to email.";

  const interests = parseInterests(input.primaryInterest);
  if (!interests.every((slug) => PRIMARY_INTERESTS.some((o) => o.value === slug)))
    errors.primaryInterest = "Choose from the list.";
  else if (interests.includes(EXCLUSIVE_INTEREST) && interests.length > 1)
    errors.primaryInterest = "“Not sure yet” cannot be combined with another choice.";

  if (!isOption(INDUSTRIES, input.industry)) errors.industry = "Choose from the list.";
  if (!isOption(COMPANY_SIZES, input.companySize)) errors.companySize = "Choose from the list.";
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
