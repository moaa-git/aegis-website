import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConsultationProvider } from "@/components/ConsultationProvider";

// Inter Display is the optical-size cut of the Inter variable font; loading
// the opsz axis lets the browser select it automatically at display sizes.
const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aegis Ascent | Microsoft 365 Security & Automation for SMBs",
  description:
    "Enterprise-grade Microsoft 365 security hardening, compliance, and automation for small businesses and law firms across Central Illinois. Fixed-scope, fixed-price engagements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ConsultationProvider>{children}</ConsultationProvider>
      </body>
    </html>
  );
}
