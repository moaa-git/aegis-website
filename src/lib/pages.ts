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
    cards: [
      {
        icon: "/images/icon-shield-card.svg",
        title: "Autopilot Deployment",
        body: "Zero-touch provisioning. We configure laptops to be business-ready the moment your employee connects to WiFi.",
        highlighted: true,
      },
      {
        icon: "/images/icon-legal.svg",
        title: "Device Hardening",
        body: "BitLocker encryption enforcement, USB blocking, and screen lock policies.",
      },
      {
        icon: "/images/icon-ai.svg",
        title: "Mobile Application Management (MAM)",
        body: "Secure company data on personal phones without spying on your employees.",
      },
      {
        icon: "/images/icon-table.svg",
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
      width: 915,
      height: 784,
      // Comp node 149:377 is 915 wide at x=525 y=0, so its centre is 262.5px
      // right of the composition centre.
      offsetX: 262.5,
      top: 0,
      /**
       * Three masks composited. The first is the comp's own right-edge
       * gradient (149:377, mask-size 1105.615x783.982 at -44px 2.018px),
       * which the flattened export dropped.
       *
       * The other two are ours. This artwork is an opaque RGB rectangle with
       * no alpha and a (0,14,27) background — darker than the page's
       * (15,23,42) — so its left and bottom edges read as a box. The comp
       * hides them by painting the hero glow over the top; our glow is faded
       * out before the hero's bottom edge so it cannot reproduce the clip
       * Phase 2 removed, which leaves those edges exposed. Fading the
       * artwork itself is the same treatment the landing hero's shield
       * already uses. See docs/DEVIATIONS.md.
       */
      mask: {
        image:
          "url(/images/ai-hero-mask.svg), linear-gradient(to right, transparent, black 12%), linear-gradient(to bottom, black 86%, transparent 99%)",
        size: "1105.615px 783.982px, 100% 100%, 100% 100%",
        position: "-44px 2.018px, 0 0, 0 0",
        composite: "intersect",
      },
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
