import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { loadLegalDoc } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service | Aegis Ascent",
  description:
    "The legal terms governing your access to and use of the Aegis Ascent website and services.",
};

export default async function TermsOfServicePage() {
  const doc = await loadLegalDoc("terms");
  return <LegalPage doc={doc} />;
}
