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
