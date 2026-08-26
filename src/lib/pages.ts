/**
 * Interior page copy, transcribed from the Figma interior frames.
 *
 * Kept out of data.ts because that file's provenance is the "Home" frame
 * (1:2); these come from different frames and are worth being able to trace
 * separately:
 *
 *   Endpoint Management & Security  112:26
 *   Compliance & eDiscovery         125:668
 *   AI & Copilot Readiness          149:38
 *   Infrastructure & Networking     164:594
 *
 * Departures from the canvas are logged in docs/DEVIATIONS.md.
 */

import type { FeatureCard } from "@/components/FeatureCardGrid";
import type { StackedFeature } from "@/components/StackedFeatureRow";
import type { ListColumn } from "@/components/TwoColumnList";
import type { PanelCell } from "@/components/DividedPanel";

export const endpointPage = {
  hero: {
    eyebrow: "Endpoint Management & Security",
    // Two lines in the comp (112:486), kept as an explicit break.
    title: ["Secure Your Devices.", "Enable Your Workforce."],
    subtitle:
      "The modern office is everywhere. If you can't wipe a lost device remotely or block a compromised login instantly, your business is vulnerable.",
    primaryCta: { label: "View Service Packages", href: "/#packages" },
    secondaryCta: { label: "Schedule a Consultation" },
    illustration: {
      src: "/images/EndpointManagementHeroImage.svg",
      width: 465,
      height: 432,
      // Comp 119:598 sits at x=849 y=195 in the 1440 frame, so its centre is
      // 361.5px right of the composition centre.
      offsetX: 361.5,
      top: 195,
    },
  },

  deviceManagement: {
    eyebrow: "Microsoft Intune",
    title: "Device Management",
    // Order is the comp's row-wise reading order: Autopilot top-left,
    // Device Hardening top-right, MAM bottom-left, Conditional Access
    // bottom-right (112:223 / 112:261 / 112:242 / 112:283).
    /**
     * Glyphs remapped 2026-08-25 at the user's request. The comp assigns
     * these four cards the landing page's Services icons in a different
     * order, so Device Hardening got a scales-of-justice and Mobile
     * Application Management an AI sparkle. Every replacement is an existing
     * node from the same Figma file, so the set stays in its own style:
     * rocket (34:8817), lock (136:776), mobile (115:583), vpn-lock (194:302).
     *
     * Each is an `icon-card-*` variant: the glyph recoloured to
     * --color-accent and carrying the file's own halo (a #4084C1 circle at
     * 50%, Gaussian blur 3.7 scaled to the glyph's viewBox), exactly as
     * icon-shield-card and the Infrastructure card glyphs draw it. They are
     * separate files because the plain glyphs are in use elsewhere -- rocket
     * on the landing pricing card, lock on the Compliance page, vpn on the
     * Infrastructure gradient tile -- where neither treatment belongs.
     */
    cards: [
      {
        icon: "/images/icon-card-rocket.svg",
        title: "Autopilot Deployment",
        body: "Zero-touch provisioning. We configure laptops to be business-ready the moment your employee connects to WiFi.",
        highlighted: true,
      },
      {
        icon: "/images/icon-card-lock.svg",
        title: "Device Hardening",
        body: "BitLocker encryption enforcement, USB blocking, and screen lock policies.",
      },
      {
        icon: "/images/icon-card-mobile.svg",
        title: "Mobile Application Management (MAM)",
        body: "Secure company data on personal phones without spying on your employees.",
      },
      {
        icon: "/images/icon-card-vpn.svg",
        title: "Conditional Access",
        body: "Geographic blocking (e.g., 'Block logins from outside US') and MFA enforcement.",
      },
    ] satisfies FeatureCard[],
  },

  endpointDefense: {
    eyebrow: "Sophos Protection",
    title: "Endpoint Defense",
    features: [
      {
        icon: "/images/icon-microsoft.svg",
        title: "Microsoft Defender for Business",
        body: "Next-gen antivirus and ransomware protection configured to auto-remediate threats within the Microsoft 365 ecosystem.",
      },
      {
        icon: "/images/icon-alert.svg",
        title: "Sophos Intercept X & XDR",
        body: "Industry-leading ransomware protection (CryptoGuard) and exploit prevention. We configure your XDR dashboard to give your team total visibility across endpoints and servers.",
      },
      {
        icon: "/images/icon-server.svg",
        title: "Server Protection",
        body: "Hardening Windows/Linux servers to block lateral movement.",
      },
    ] satisfies StackedFeature[],
  },
};

export const compliancePage = {
  hero: {
    eyebrow: "Trusted by Regulated Industries",
    // Three lines in the comp (125:887).
    title: [
      "Governance, Risk, and",
      "Compliance (GRC) for",
      "Regulated Industries",
    ],
    subtitle:
      "Whether facing a surprise subpoena or a scheduled SEC audit, scrambling is a liability. We align your Microsoft 365 environment for instant, defensible eDiscovery and continuous regulatory compliance (HIPAA, PCI, DDQ).",
    primaryCta: { label: "View Service Packages", href: "/#packages" },
    secondaryCta: { label: "Schedule a Consultation" },
    // 125:795 sets an 80px header gap and a 574px subhead measure.
    headerGap: 80,
    subtitleWidth: 574,
    illustration: {
      src: "/images/ComplianceHeroImage.svg",
      width: 721,
      height: 749,
      // Comp node 137:1023 is 635x657 at x=733 y=110; the export carries
      // 43px/46px of blur padding, so it lands at x=690 y=64 and its centre
      // is 330.5px right of the composition centre.
      offsetX: 330.5,
      top: 64,
    },
  },

  promise: {
    // The comp badges this "The Solution" and badges the next band the same
    // way — a duplicated label. The brief distinguishes them; see
    // docs/DEVIATIONS.md.
    eyebrow: "Our Promise",
    title: "Defensible by Design",
    body: {
      lead: "We architect Microsoft Purview to handle legal holds, content searches, and data retention policies automatically.",
      emphasis:
        "All data access and search queries are handled personally by U.S.-based consultants.",
    },
    items: [
      "Automated legal holds and content searches",
      "All data access handled by U.S.-based consultants",
      "Microsoft Purview expertly configured",
      "Data retention policies configured to your requirements",
      "Role-based access and audit trails",
    ],
  },

  solutions: {
    eyebrow: "The Solutions",
    title: "Comprehensive Compliance Solutions",
    subtitle:
      "Every engagement includes meticulously configured controls tailored to your regulatory requirements.",
    columns: [
      {
        title: "Legal & eDiscovery",
        items: [
          {
            icon: "/images/icon-search.svg",
            title: "eDiscovery Standard/Premium Setup",
            body: "Configuration of cases, custodian management, and role-based access.",
          },
          {
            icon: "/images/icon-note-done.svg",
            title: "Content Search & Export",
            body: "Rapid extraction of emails, Teams chats, and SharePoint files for litigation review.",
          },
          {
            icon: "/images/icon-lock.svg",
            title: "Legal Hold Workflows",
            body: "Policies to freeze data instantly for litigation without user intervention.",
          },
          {
            icon: "/images/icon-alert-lg.svg",
            title: "Data Loss Prevention (DLP)",
            body: "Block credit cards, social security numbers, or case files from being emailed externally.",
          },
        ],
      },
      {
        title: "Regulatory Frameworks",
        items: [
          {
            icon: "/images/icon-shield-outline.svg",
            // Comp reads "DLP (Data Loss Prevention)", which duplicates the
            // left column's entry; the brief's title disambiguates it.
            title: "DLP for PII/Credit Cards",
            body: "Automated blocking of Credit Cards, Medical Records, and Social Security Numbers from leaving your organization.",
          },
          {
            icon: "/images/icon-note-check-lg.svg",
            title: "Due Diligence (DDQ) Remediation",
            body: "We help you pass vendor risk assessments by implementing the missing controls required by your enterprise clients.",
          },
          {
            icon: "/images/icon-data.svg",
            title: "SEC 17a-4 Alignment",
            body: "Configuration of preservation locks and immutable storage for financial record retention.",
          },
          {
            icon: "/images/icon-note.svg",
            title: "Audit Logging",
            body: "Enabling Unified Audit Logs to track file access and admin activities for compliance reporting.",
          },
        ],
      },
    ] satisfies [ListColumn, ListColumn],
  },
};

export const aiPage = {
  hero: {
    eyebrow: "AI & Copilot Readiness",
    eyebrowIcon: "/images/icon-brain.svg",
    title: ["Deploy Microsoft Copilot", "Without Leaking Your Data"],
    subtitle:
      "Copilot respects your existing permissions. If your permissions are messy, Copilot will surface sensitive HR or salary data to everyone in the company.",
    primaryCta: { label: "View Service Packages", href: "/#packages" },
    secondaryCta: { label: "Schedule a Consultation" },
    // 149:219 sets a 108px header gap; the subhead runs the text column.
    headerGap: 108,
    subtitleWidth: 640,
    illustration: {
      src: "/images/AICopilotHeroImage.svg",
      // The user's masked re-export is 959 wide: the comp's mask sat at
      // -44px, and that 44px is now part of the artwork on the left. Content
      // is unmoved (its brightest pixel shifts by exactly +44), so the left
      // edge lands at the comp's x=481 and the centre 240.5px right of the
      // composition centre.
      width: 959,
      height: 784,
      offsetX: 240.5,
      top: 0,
      // No CSS mask. The left fade comes from the user's masked export; the
      // comp's right-edge gradient and a bottom falloff are baked into the
      // same file. Keeping this off the CSS side matters — a mask-image on a
      // large layer is what made the Story arc drop its raster tiles.
      behind: true,
    },
  },

  readiness: {
    eyebrow: "Technical Readiness",
    title: "Core Readiness Deliverables",
    cells: [
      {
        title: "Data Permissibility Audit",
        body: "Scanning SharePoint and OneDrive for overshared sensitive files.",
      },
      {
        title: "Semantic Indexing",
        body: "Configuring your tenant to ensure Copilot gives relevant, high-quality answers.",
      },
      {
        title: "License Assignment & Policy",
        body: "Setup of Copilot licenses and governance policies to prevent IP leakage.",
      },
    ] satisfies PanelCell[],
  },

  advanced: {
    title: "Advanced AI Services (Copilot Studio)",
    cards: [
      {
        title: "Custom Copilot Building",
        body: 'We use Copilot Studio to build specific AI agents for your internal teams (e.g., an "HR Bot" trained only on your handbook, or a "Legal Bot" grounded in your case archives).',
      },
      {
        title: "Knowledge Base Grounding",
        body: "Connecting Copilot to specific data sources (SQL, Salesforce, or specific SharePoint Libraries) so it answers questions with your actual business data, not hallucinations.",
      },
    ] satisfies FeatureCard[],
  },

  enablement: {
    title: "User Enablement & Training",
    cards: [
      {
        // Comp reads "Role-Based Prompt Packs"; the brief paraphrases it as
        // "Role-Specific". Card titles follow the canvas.
        title: "Role-Based Prompt Packs",
        body: 'We don\'t just turn it on; we teach your staff how to use it. We provide "Cheat Sheets" for executives (summarizing), sales (proposal drafting), and HR (job descriptions).',
      },
      {
        title: "Agent Training",
        body: "Teaching your team how to interact with custom agents for maximum productivity.",
      },
    ] satisfies FeatureCard[],
  },
};

export const infrastructurePage = {
  hero: {
    eyebrow: "Enterprise Security",
    eyebrowIcon: "/images/icon-brain.svg",
    title: ["Robust Cloud Infrastructure", "& Network Defense"],
    subtitle:
      "Move to the cloud with zero downtime and secure your physical office against intrusion. Enterprise-grade protection for modern businesses.",
    primaryCta: { label: "View Service Packages", href: "/#packages" },
    secondaryCta: { label: "Schedule a Consultation" },
    // 164:729 sets a 108px header gap; the subhead runs the 569px column.
    headerGap: 108,
    subtitleWidth: 640,
    illustration: {
      src: "/images/NetworkInfraHeroImage.svg",
      width: 515,
      height: 481,
      // Comp node 197:352 is 515x481 at x=825 y=191 — the export matches the
      // node exactly, with no blur padding to account for.
      offsetX: 362.5,
      top: 191,
      // Same stacking as AI & Copilot: the illustration precedes the Hero
      // Section in the comp, so it sits behind the glow.
      behind: true,
    },
  },

  cloud: {
    eyebrow: "Microsoft 365",
    title: "Cloud Infrastructure",
    // Comp reading order: Tenant top-left, Exchange top-right, Identity
    // bottom-left, Email Authentication bottom-right (193:188 / 193:212 /
    // 193:200 / 193:227).
    cards: [
      {
        icon: "/images/icon-tenant.svg",
        title: "Tenant Creation & Hardening",
        body: "Best-practice setup of your environment with 'Security Defaults' disabled and custom security applied.",
        highlighted: true,
      },
      {
        icon: "/images/icon-exchange.svg",
        title: "Exchange Online Migration",
        body: "Moving email, calendars, and contacts from IMAP, Gmail, or Exchange On-Prem to Microsoft 365.",
      },
      {
        icon: { base: "/images/icon-halo.svg", glyph: "/images/icon-group.svg" },
        title: "Identity Management",
        body: "Entra ID (Azure AD) setup, syncing with local AD if required (Hybrid Join).",
      },
      {
        icon: { base: "/images/icon-halo.svg", glyph: "/images/icon-key.svg" },
        title: "Email Authentication",
        body: "Full configuration of SPF, DKIM, and DMARC to ensure your emails don't go to spam.",
      },
    ] satisfies FeatureCard[],
  },

  network: {
    eyebrow: "Sophos",
    title: "Network Security",
    features: [
      {
        icon: "/images/icon-firewall.svg",
        title: "Sophos Firewall (XGS) Configuration",
        body: "Setup of XGS Series firewalls with Deep Packet Inspection (DPI) and Intrusion Prevention (IPS).",
      },
      {
        icon: "/images/icon-sync.svg",
        title: "Synchronized Security",
        body: "Configuring the 'Heartbeat' between your Firewall and Endpoints to instantly revoke network access for compromised devices.",
      },
      {
        icon: "/images/icon-vpn.svg",
        title: "VPN & Remote Access",
        body: "Secure SSL VPN or SD-RED setup for connecting remote workers safely.",
      },
      {
        icon: "/images/icon-network.svg",
        title: "Network Segmentation",
        body: "Isolating Guest WiFi, IoT devices, and corporate data for enhanced security boundaries.",
      },
    ] satisfies StackedFeature[],
  },
};
