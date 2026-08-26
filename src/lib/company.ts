/**
 * Copy for the three company pages — Our Story, Methodology, FAQ.
 *
 * Provenance is `aegis-page-drafts-v5.md` in the repo root, not the Figma
 * file: these three routes have no comp. Kept separate from data.ts (frame
 * "Home" 1:2) and pages.ts (the four interior pillar frames) for the same
 * reason those two are separate — so a page's source can be traced without
 * reading the whole file.
 *
 * The v5 draft is the source of truth for the words. Where it describes a
 * treatment rather than dictating markup ("Credentials strip", "Accordion,
 * three groups"), the structure below is the design-system reading of it and
 * the departure, if any, is logged in docs/DEVIATIONS.md.
 */

import type { FeatureCard } from "@/components/FeatureCardGrid";
import type { ListColumn } from "@/components/TwoColumnList";
import type { PanelCell } from "@/components/DividedPanel";
import type { DiagramRow } from "@/components/PhaseDiagram";

export const storyPage = {
  hero: {
    eyebrow: "About Aegis Ascent",
    // Two lines, split at the natural clause break the way the pillar heroes
    // are (112:486). Measures 739px, inside the 800px centred column.
    title: ["Eighteen Years of Enterprise IT,", "Pointed at Smaller Businesses"],
    subtitle:
      "High-stakes security, governance, and architecture without enterprise bloat, endless retainers, or junior account reps.",
    primaryCta: { label: "View Service Packages", href: "/#packages" },
    secondaryCta: { label: "Schedule a Consultation" },
    subtitleWidth: 640,
    titleWidth: 800,
  },

  /**
   * Sections 1-3 of Our-story-update.md. Headings are kept exactly as
   * written — sentence case, trailing period — rather than normalised to the
   * site's Title Case noun phrases. They are full sentences, not labels, and
   * the copy is the author's. Flagged in docs/DEVIATIONS.md.
   */
  standard: {
    eyebrow: "The Standard",
    title: "Enterprise rigor isn't just for the Fortune 500.",
    paragraphs: [
      "Most small and mid-market organizations are forced to choose between two broken IT models: overpriced legacy MSPs that lock you into bloated multi-year retainers, or break-fix contractors who lack the architectural depth to handle modern compliance and cloud security.",
      "Aegis Ascent was built to offer a third option: senior-level systems engineering, delivered through clear, fixed-scope projects that leave your environment cleaner, faster, and genuinely defensible.",
    ],
  },

  background: {
    eyebrow: "The Background",
    title: "Proven in the trenches, built for modern threats.",
    paragraphs: [
      "Over the last eighteen years, I've designed, secured, and scaled enterprise infrastructures where downtime wasn't an option and regulatory scrutiny was constant.",
      "That background spans:",
    ],
    /** Existing /images/icon-*.svg glyphs, in the set's own style. */
    areas: [
      {
        icon: "/images/icon-key.svg",
        title: "Deep Identity & Cloud Security",
        body: "Hardening Microsoft 365, Entra ID, and cloud perimeters against real-world attack vectors.",
      },
      {
        icon: "/images/icon-shield-outline.svg",
        title: "Modern Endpoint Defense",
        body: "Deploying automated, defense-in-depth tooling like Sophos and Intune that proactively stop lateral movement.",
      },
      {
        icon: "/images/icon-note-check-lg.svg",
        title: "Compliance & Defensibility",
        body: "Structuring data governance, eDiscovery, and retention policies that hold up during audits and legal holds.",
      },
      {
        icon: "/images/icon-ai.svg",
        title: "AI Readiness",
        body: "Safely implementing tools like Microsoft Copilot without accidentally opening up internal payroll or legal data to every user.",
      },
    ],
  },

  philosophy: {
    eyebrow: "The Philosophy",
    title: "How we work differently.",
    cards: [
      {
        title: "No Open-Ended Invoices",
        body: "Every engagement is fixed-scope and fixed-price. You know exactly what work is being done, what it costs, and when it's finished.",
      },
      {
        title: "You Talk to the Engineer",
        body: "No layers of account managers, sales reps, or tier-1 escalations. The person designing your solution is the person doing the work.",
      },
      {
        title: "Built to Hand Off",
        body: "We don't engineer dependencies to keep you on a leash. We build clean, documented, automated environments that your internal team or primary provider can manage with ease.",
      },
    ],
  },

  credentials: {
    eyebrow: "Credentials",
    title: "Certifications & Partnerships",
    items: [
      {
        icon: "/images/icon-microsoft.svg",
        label: "Microsoft 365 Certified: Security Administrator Associate (MS-500)",
      },
      {
        // icon-network is a WiFi glyph; icon-server carries the A+/Server+
        // half of this line as well.
        icon: "/images/icon-server.svg",
        label: "CompTIA A+, Network+, Server+",
      },
      {
        // NOT icon-shield: despite the name that file is a location pin —
        // Expertise.tsx maps its "location" trust item to it. This is the
        // actual shield.
        icon: "/images/icon-shield-outline.svg",
        label: "Sophos Silver Partner — twelve-plus product accreditations",
      },
      {
        icon: "/images/icon-ai.svg",
        label: "Microsoft AI Cloud Partner Program member",
      },
    ],
  },

  cta: {
    title: "Let's fix the gaps before they become incidents.",
    button: "Request a Consultation",
    secondary: { label: "View Our Methodology", href: "/methodology" },
  },
} as const;

// ---------------------------------------------------------------- methodology

const diagramRows: DiagramRow[] = [
  {
    type: "phases",
    nodes: [
      {
        number: 1,
        icon: "/images/icon-group.svg",
        title: "Scope",
        body: "A conversation about what you have. Free, and nothing is touched.",
      },
    ],
  },
  { type: "agreement", label: "Assessment agreement" },
  {
    type: "phases",
    nodes: [
      {
        number: 2,
        icon: "/images/icon-search.svg",
        title: "Assess",
        body: "The deep read, done by hand across identity, perimeter, network and detection.",
      },
      {
        number: 3,
        icon: "/images/icon-document.svg",
        title: "Design",
        body: "Every finding written up, priced, and approved or struck line by line.",
      },
    ],
  },
  { type: "agreement", label: "Remediation agreement" },
  {
    type: "phases",
    nodes: [
      {
        number: 4,
        icon: "/images/icon-rocket.svg",
        title: "Deploy",
        body: "The approved design executed, piloted where it can be, logged throughout.",
      },
      {
        number: 5,
        icon: "/images/icon-note-check.svg",
        title: "Validate & Hand Off",
        body: "QA on every changed item, a full report, and the keys back.",
      },
    ],
  },
];

const assessColumns: [ListColumn, ListColumn] = [
  {
    title: "Cloud, identity & detection",
    items: [
      {
        icon: "/images/icon-microsoft.svg",
        title: "Microsoft 365 and identity",
        body: "Every part of Intune, Entra, and Azure, walked manually. Secure Score and what's actually behind the number. Conditional Access policies — what exists, what's missing, what's misconfigured. MFA coverage and its gaps. Admin accounts, who holds them, and whether they should. License assignment against what's actually in use.",
      },
      {
        icon: "/images/icon-mail.svg",
        title: "External posture",
        body: "Domain and email authentication — whether SPF, DKIM, and DMARC are configured and enforced — and what your public-facing services look like from outside.",
      },
      {
        icon: "/images/icon-alert.svg",
        title: "Detection",
        body: "Whether MDR or XDR is in place and whether it's tuned. Whether detections exist for the things that matter: risky sign-ins, impossible travel, privilege escalation.",
      },
    ],
  },
  {
    title: "Perimeter, network & resilience",
    items: [
      {
        icon: "/images/icon-firewall.svg",
        title: "Perimeter",
        body: "Your firewall directly. Which ports are open and why. Who can reach the management interface, from the WAN or the LAN. How many admin accounts and who they belong to. Whether MFA protects them. IPS and DDoS protection status.",
      },
      {
        icon: "/images/icon-network.svg",
        title: "Internal network",
        body: "A scan across every IP. Rogue DHCP servers, switches, access points, phones, printers, anything answering. Those devices then get checked for default credentials and open management access, because that's where the quiet problems live.",
      },
      {
        icon: "/images/icon-server.svg",
        title: "Resilience",
        body: "High availability, redundant circuits, what happens when the primary path fails.",
      },
    ],
  },
];

const designCards: FeatureCard[] = [
  {
    title: "What's wrong",
    body: "The finding itself, stated plainly enough that you can hand it to someone else and have them understand it.",
  },
  {
    title: "Why it matters",
    body: "The actual risk, not a severity label.",
  },
  {
    title: "The fix",
    body: "What would be changed, and how.",
  },
  {
    title: "How it affects your users",
    body: "What changes for the people who work there.",
  },
  {
    title: "How to roll it back",
    body: "The exit path if it causes a problem.",
  },
];

const fixedScopeCells: PanelCell[] = [
  {
    title: "The assessment price",
    body: "Fixed at the scoping conversation. It covers the full review plus the Design document.",
  },
  {
    title: "The remediation price",
    body: "Fixed at Design sign-off. Items you approve are in scope. Items you decline are out. Anything discovered or requested after sign-off requires a written amendment with its own price, so you're never surprised by an invoice.",
  },
];

export const methodologyPage = {
  hero: {
    eyebrow: "How We Work",
    // Three lines, not two: "Against Something Already Known" measures 835px
    // and orphans "Known" in the centred 800px column.
    title: [
      "Two Fixed Prices,",
      "Each Quoted Against",
      "Something Already Known",
    ],
    subtitle:
      "Nobody can price remediation without knowing what's broken. So we don't try. The scoping conversation is free. The assessment is priced from that conversation. The remediation work is priced from the assessment findings. You approve each step before it starts, and neither price moves once agreed.",
    primaryCta: { label: "View Service Packages", href: "/#packages" },
    secondaryCta: { label: "Schedule a Consultation" },
    subtitleWidth: 640,
    // Centred content column; see PageHero's `align`.
    titleWidth: 800,
  },

  diagram: {
    eyebrow: "The Engagement",
    title: "Five Phases, Two Agreements",
    subtitle:
      "You sign twice. Everything in between is work you've already read and approved.",
    rows: diagramRows,
  },

  scope: {
    number: 1,
    title: "Scope",
    meta: "Half a day. No cost, no obligation.",
    paragraphs: [
      "A conversation about what you have. Circuit provider, firewall, how identity is handled, whether MFA is enforced and on what, what runs on premises versus in the cloud, what's been worrying you.",
      "This stage is conversation only. No access, no scanning, nothing touched. Hands-on work starts once there's a signed agreement, which protects both of us.",
      "That conversation is enough to size the assessment — user count, number of sites, how many firewalls, cloud-only or hybrid. You get a written assessment scope and a fixed price for it.",
    ],
  },

  assessmentAgreement: {
    title: "Assessment agreement",
    paragraphs: [
      "You sign, or you don't. Nothing has cost you anything up to this point.",
    ],
  },

  assess: {
    number: 2,
    title: "Assess",
    meta: "One to five days depending on scope.",
    paragraphs: [
      "The deep read. Done by hand, not by running a scanner and forwarding the PDF.",
    ],
    columns: assessColumns,
  },

  design: {
    number: 3,
    title: "Design",
    paragraphs: ["Every finding becomes a written item with five parts:"],
    cards: designCards,
    review:
      "You review the full set and mark what you want done. Anything you decline gets struck.",
    ends: {
      lead: "The assessment engagement ends here.",
      body: "You own the findings and the Design document whether or not you go further. If you want to hand it to internal staff or another vendor, it's yours — that's what you paid for.",
    },
  },

  remediationAgreement: {
    title: "Remediation agreement",
    paragraphs: [
      "The approved Design items become the remediation scope, priced against a list you've already read line by line.",
    ],
    credit: {
      lead: "If you proceed within 60 days, the assessment fee is credited against the remediation engagement.",
      body: "The assessment pays for itself the moment you decide to act on it.",
    },
  },

  deploy: {
    number: 4,
    title: "Deploy",
    paragraphs: [
      "The design gets executed.",
      "Changes go to a pilot group first unless the change is inherently global. A Conditional Access policy can be piloted; a DNS change can't.",
      "Work happens when it makes sense for your business — after hours, early morning, whichever day is slow. You get a detailed change log recording what was changed, when, and who it affected.",
      "Everything is reviewed and QA'd before handoff. Nothing gets marked complete because the ticket says so.",
    ],
  },

  validate: {
    number: 5,
    title: "Validate & Hand Off",
    paragraphs: [
      "Every item marked for change gets a QA review. Screenshots and logs are captured where they're needed as evidence.",
      "You receive a full report of the work performed, with an executive summary for people who need the outcome rather than the detail.",
      "An admin walkthrough is available as an add-on. It's not bundled because it takes real time and not everyone wants it.",
      "After handoff, your administrators have access to the environment again. That means a bounded support window rather than an open-ended guarantee: for thirty days after completion, we'll investigate anything that appears to trace back to the work performed. Beyond that, changes made by others make it impossible to attribute a problem honestly. Further work is welcome and gets scoped separately.",
    ],
  },

  fixedScope: {
    eyebrow: "The Commitment",
    title: "What Fixed-Scope Actually Means",
    subtitle: "Two prices, two boundaries.",
    cells: fixedScopeCells,
    closing:
      "If the environment turns out materially worse than the scoping conversation suggested, that surfaces during the assessment — before remediation is priced, before work begins, and while you can still decide how much of it to take on.",
  },

  cta: {
    title: "Start With the Free Conversation",
    body: "Half a day, no access, no obligation. You leave with a written assessment scope and a fixed price for it.",
    button: "Schedule a Consultation",
  },
} as const;

// ----------------------------------------------------------------------- faq

export const faqPage = {
  hero: {
    eyebrow: "Common Questions",
    title: ["Questions We Get Asked"],
    subtitle:
      "Straight answers about how engagements work, what they cost, and what access we need.",
    primaryCta: { label: "View Service Packages", href: "/#packages" },
    secondaryCta: { label: "Schedule a Consultation" },
    subtitleWidth: 620,
    titleWidth: 800,
  },

  groups: [
    {
      title: "How we work",
      items: [
        {
          q: "Are you a managed service provider?",
          a: [
            "No. An MSP sells a monthly contract and takes over ongoing operations. Aegis Ascent does defined projects with a start, an end, and a fixed price. You get the work without a recurring commitment and you keep control of your own environment. For most businesses under two hundred people, that costs meaningfully less than a year of managed services.",
          ],
        },
        {
          q: "Why don't you publish prices?",
          a: [
            "The same project is a different amount of work at every company. Compliance work for a six-attorney firm and a forty-attorney firm share a name and nothing else. A published number would have to cover the worst case, and you'd be paying for someone else's complexity.",
            "What's fixed is the price against an agreed scope. If something new surfaces or you want to add work, that's a written amendment with its own price — never a surprise on the invoice.",
            "The scoping conversation is free, so you know the number before you commit to anything.",
          ],
        },
        {
          q: "Do I have to commit to the whole thing up front?",
          a: [
            "No. The assessment and the remediation work are separate engagements with separate prices. You can stop after the assessment and keep the findings and the remediation plan, whether you hand them to internal staff, another vendor, or a drawer.",
            "If you do proceed within 60 days, the assessment fee is credited against the remediation engagement.",
          ],
        },
        {
          q: "Is Aegis Ascent one person?",
          a: [
            "Yes. The person who scopes your project does the work and answers the phone afterward. Nothing gets translated into a ticket and handed off to someone you've never met.",
            "That limits how many engagements run at once. It also means nothing gets lost in translation, which is why “Expertise You Can Talk To” isn't just a line on the front page.",
          ],
        },
        {
          q: "Do you work remotely or on site?",
          a: [
            "Remote for anything that can be done remotely, which covers most Microsoft 365, identity, and policy work. Some things need hands on hardware — firewall deployments in particular — and for those I travel up to 150 miles from Peoria. Travel is quoted as a dispatch fee inside the original scope, based on distance, so it's never a surprise line item.",
          ],
        },
        {
          q: "What happens when a project ends?",
          a: [
            "You get the full report, the change log, and thirty days of support for anything that appears to trace back to the work performed.",
            "After that, your administrators have had access to the environment again, and attributing a new problem to work completed a month earlier stops being honest. You're welcome to come back for more work at any point — it gets scoped separately unless we've agreed otherwise up front.",
          ],
        },
      ],
    },
    {
      title: "Who we work with",
      items: [
        {
          q: "What size organizations?",
          a: [
            "Roughly ten to two hundred people. Small enough that a dedicated security hire doesn't make sense, large enough that the risk is real and somebody has noticed.",
          ],
        },
        {
          q: "Do you only work with law firms?",
          a: [
            "No. The specialization is security, compliance, and AI readiness — not a single industry. Law firms are a strong early focus because eDiscovery, retention policy, and legal hold in Microsoft Purview are a well-defined problem I've solved repeatedly, and because the consequences of getting client data wrong are unusually clear there.",
            "The same work applies anywhere sensitive data matters. Financial services, healthcare, agriculture, manufacturing, professional services.",
          ],
        },
        {
          q: "How far do you travel?",
          a: [
            "Onsite work goes up to 150 miles from Peoria, which covers most of Central Illinois and reaches into the Quad Cities, Champaign, Springfield, and the Bloomington-Normal corridor. Remote work has no geographic limit. Farther onsite travel is possible if the engagement justifies it.",
          ],
        },
      ],
    },
    {
      title: "Technical",
      items: [
        {
          q: "What's your relationship with Sophos?",
          a: [
            "Aegis Ascent is a Sophos Silver Partner with twelve-plus product accreditations across endpoint, XDR, MDR, and firewall. Practically: direct access to Sophos support and engineering rather than going through a reseller, correct licensing without markup games, and someone configuring the product who has been trained on it rather than reading the manual on your time.",
          ],
        },
        {
          q: "Do we need to be on Microsoft 365 already?",
          a: [
            "No. Tenant creation and migration are part of the work. Legacy on-premises Exchange, Google Workspace, or a mix nobody has documented are all normal starting points.",
          ],
        },
        {
          q: "Can you help if we're mid-migration or inherited a mess?",
          a: [
            "That's most engagements. Environments configured correctly from the start don't usually need this work. Half-finished migrations, tenants stood up years ago by someone who left, and security settings enabled once and never revisited are the normal case.",
          ],
        },
        {
          q: "What access do you need, and what happens to it afterward?",
          a: [
            "The assessment is read-only. Global Reader in Microsoft 365 and read access to your firewall shows everything without the ability to change anything.",
            "Every account is a named account created specifically for this engagement. No shared credentials, no borrowing an existing admin login. Where automation is used to collect data or apply changes, it runs under its own separate service account rather than mine — so your audit log distinguishes what a person did from what a tool did, and both trace back to something identifiable.",
            "When the engagement ends, every account is stripped of its rights and removed.",
          ],
        },
      ],
    },
  ],
} as const;
