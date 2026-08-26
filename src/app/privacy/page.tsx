import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { loadLegalDoc } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | Aegis Ascent",
  description:
    "How Aegis Ascent, LLC. collects, uses, shares, and protects your personal information, and the privacy rights available to you.",
};

export default async function PrivacyPolicyPage() {
  const doc = await loadLegalDoc("privacy");
  return <LegalPage doc={doc} />;
}
