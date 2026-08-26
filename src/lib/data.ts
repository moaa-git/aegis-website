// All site copy lives here. Sourced from the Figma frame "Home" (1:2) where
// the file held real copy; deviations (fixed phone number, replaced template
// debris, invented items) are logged in docs/DEVIATIONS.md.

export const site = {
  name: "Aegis Ascent",
  email: "contact@aegisascent.com",
  phone: "(309) 226-9989",
  phoneHref: "tel:3092269989",
  location: "Central Illinois",
};

/**
 * The four pillar pages. Route slugs live here so the Services cards, the
 * footer column and the pages themselves cannot drift apart.
 *
 * `interest` is the Primary interest each page's hero CTA preselects, from
 * PRIMARY_INTERESTS in src/lib/consultation-fields.ts.
 *
 * Not to be confused with `interest` on the Services cards below, which is a
 * PillarKey used for routing.
 */
export const pillarPages = {
  "endpoint-security": {
    href: "/endpoint-security",
    title: "Endpoint Management & Security",
    interest: "sophos-endpoint-mdr",
  },
  "compliance-legal": {
    href: "/compliance-ediscovery",
    title: "Compliance & eDiscovery",
    interest: "ediscovery-legal-hold",
  },
  "ai-modern-work": {
    href: "/ai-copilot-readiness",
    title: "AI & Copilot Readiness",
    interest: "copilot-ai-readiness",
  },
  "infrastructure-network": {
    href: "/infrastructure-networking",
    title: "Infrastructure & Networking",
    interest: "infrastructure-networking",
  },
} as const;

export type PillarKey = keyof typeof pillarPages;

export const nav = {
  // Absolute, not bare fragments: the four sections these point at exist only
  // on the landing page, so from an interior page "#services" scrolled
  // nowhere. "#contact" is the exception -- every page's footer carries that
  // id -- and is deliberately left in-page.
  links: [
    { label: "Services", href: "/#services" },
    { label: "Packages", href: "/#packages" },
    { label: "Our Story", href: "/#story" },
    { label: "Contact", href: "#contact" },
  ],
  cta: { label: "Request Consultation" },
};

export const hero = {
  badge: "Securing Your Rise to the Top",
  title: "Enterprise-Grade Microsoft 365 Security & Automation for SMBs",
  subtitle:
    "We harden your infrastructure, secure your endpoints, and ensure compliance, without the overhead of a managed service provider.",
  primaryCta: { label: "View Service Packages", href: "#packages" },
  secondaryCta: { label: "Schedule a Consultation", href: "#contact" },
};

export const expertise = {
  title: "Expertise You Can Talk To",
  body: "100% U.S.-based execution. Direct consultant access. Zero outsourcing. Unlike many IT firms, we do not farm your security work out to outside call centers. You work directly with the expert architecting your solution.",
  trust: [
    { icon: "location", label: "US-Based Execution" },
    { icon: "check", label: "Microsoft Certified" },
    { icon: "document", label: "Fixed-Price Engagements" },
  ],
};

export const story = {
  title: ["You Focus on the Summit.", "We Watch the Ledge."],
  paragraphs: [
    "Growth brings risk. As your business rises to the top, your digital footprint expands—and so does the target on your back.",
    "Aegis Ascent was founded on a simple principle: Security shouldn't slow you down. We exist to build the technical foundation that allows ambitious companies to scale without looking down.",
    'Whether you are a law firm protecting sensitive client data or a startup deploying AI, we provide the "Aegis"—the shield—that ensures your infrastructure holds up against modern threats.',
    "Our methodology is rooted in Precision and Process. We don't guess. We deploy proven, automated frameworks that harden your endpoints and secure your data governance, ensuring your technology stack is an asset, not a liability.",
  ],
  pillars: [
    {
      icon: "/images/icon-process.svg",
      title: "Precision & Process",
      body: "We don't guess. We deploy proven, automated frameworks that harden your endpoints and secure your data governance.",
    },
    {
      icon: "/images/icon-code.svg",
      title: "Asset, Not Liability",
      body: "Your technology stack should be your competitive advantage. We ensure it holds up under scrutiny and scales with your growth.",
    },
  ],
};

export const services = {
  title: "Comprehensive Security Solutions",
  subtitle:
    "Four pillars of protection designed to secure every aspect of your digital infrastructure.",
  cards: [
    {
      icon: "/images/icon-shield-card.svg",
      title: "Endpoint & Security",
      interest: "endpoint-security",
      description:
        "Intune, Defender, and Sophos Intercept X deployment and management.",
      chips: ["Device Management", "Threat Protection", "Zero Trust Architecture"],
      highlighted: true,
    },
    {
      icon: "/images/icon-legal.svg",
      title: "Compliance & Legal",
      interest: "compliance-legal",
      description:
        "eDiscovery, Purview, and Legal Hold configuration for regulated industries.",
      chips: ["Retention Policies", "Data Classification", "Audit Trails"],
      highlighted: false,
    },
    {
      icon: "/images/icon-ai.svg",
      title: "AI & Modern Work",
      interest: "ai-modern-work",
      description:
        "Copilot Readiness and Semantic Indexing for AI-powered productivity.",
      chips: ["Copilot Setup", "Data Governance", "Workflow Automation"],
      highlighted: false,
    },
    {
      icon: "/images/icon-table.svg",
      title: "Infrastructure & Network",
      interest: "infrastructure-network",
      description:
        "Migrations, Tenant Setup, and Firewall configuration for solid foundations.",
      chips: ["Tenant Migrations", "Sophos Firewall", "Network Design"],
      highlighted: false,
    },
  ],
};

export const pricing = {
  title: "Fixed-Scope Engagement Models",
  subtitle: "Predictable pricing. Clear deliverables. No surprises.",
  cards: [
    {
      icon: "/images/icon-electric.svg",
      name: "Secure in a Day",
      package: "secure-in-a-day",
      kicker: "Audit Package",
      audience: "Small shops (10-50 users)",
      features: [
        "Secure Score review & analysis",
        "MFA enforcement setup",
        "Anti-phishing policies",
        "Basic threat assessment",
      ],
      cta: "Book Your Audit",
      popular: false,
    },
    {
      icon: "/images/icon-law.svg",
      name: "Law Firm Compliance",
      package: "law-firm-compliance",
      kicker: "Legal Bundle",
      audience: "Legal boutiques",
      features: [
        "Retention policy setup",
        "eDiscovery configuration",
        "Paralegal how-to guide",
        "Client data protection",
      ],
      cta: "Get Compliant",
      popular: false,
    },
    {
      icon: "/images/icon-note-check.svg",
      name: "Regulatory Readiness",
      package: "regulatory-readiness",
      kicker: "Audit Defense",
      audience: "Finance, Healthcare, Retail",
      features: [
        "DLP for PII/Credit Cards",
        "SEC retention rules (Finance)",
        "HIPAA compliance (Healthcare)",
        "DDQ remediation support",
      ],
      cta: "Pass Your Audit",
      popular: true,
    },
    {
      icon: "/images/icon-rocket.svg",
      name: "Full Stack Deployment",
      package: "full-stack-deployment",
      kicker: "Complete Solution",
      audience: "New companies or full migrations",
      features: [
        "Identity & access management",
        "Intune deployment",
        "Firewall configuration",
        "Full migration support",
      ],
      cta: "Request a Proposal",
      popular: false,
    },
  ],
};

export const footer = {
  blurb:
    "Enterprise-grade Microsoft 365 security and automation for ambitious SMBs.",
  columns: [
    {
      title: "Services",
      links: [
        { label: "Endpoint & Security", href: pillarPages["endpoint-security"].href },
        { label: "Compliance & Legal", href: pillarPages["compliance-legal"].href },
        { label: "AI & Modern Work", href: pillarPages["ai-modern-work"].href },
        {
          label: "Infrastructure & Network",
          href: pillarPages["infrastructure-network"].href,
        },
      ],
    },
    {
      // "About Us" and "Our Methodology" pointed at #story, and "Packages"
      // at a bare #packages -- fragments that resolved only on the landing
      // page. The first two now have real routes; "Packages" takes the
      // absolute form the header nav already uses. "Contact" stays a bare
      // fragment because every marketing page's footer carries that id.
      title: "Company",
      links: [
        { label: "About Us", href: "/our-story" },
        { label: "Our Methodology", href: "/methodology" },
        { label: "Packages", href: "/#packages" },
        { label: "Contact", href: "#contact" },
      ],
    },
    {
      // Blog, Security Checklist and Compliance Guide have no destinations
      // yet; see docs/BACKLOG.md.
      title: "Resources",
      links: [
        { label: "Blog", href: "#" },
        { label: "Security Checklist", href: "#" },
        { label: "Compliance Guide", href: "#" },
        { label: "FAQ", href: "/faq" },
      ],
    },
  ],
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};
