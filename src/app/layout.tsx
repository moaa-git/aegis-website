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
  /**
   * src/app/icon.svg is the light-scheme mark and is picked up by the file
   * convention; it inks in #112431, which vanishes against dark browser
   * chrome. This adds the reversed tile for dark mode. It has to be declared
   * here rather than as another file in app/, because the file conventions
   * cannot carry a `media` query.
   */
  icons: {
    /**
     * Both schemes are declared here rather than left to the app/icon.svg
     * file convention, because that convention cannot carry a `media` query
     * -- and declaring `icons` at all suppresses it, so the light mark has
     * to be listed too or it is simply lost.
     *
     * Light first with no media query, so it is also the fallback when the
     * browser expresses no preference. Dark is listed second: both match in
     * dark mode and the later declaration wins. favicon.ico stays as the
     * legacy fallback via its own file convention.
     */
    icon: [
      { url: "/images/favicon-light.svg", type: "image/svg+xml" },
      {
        url: "/images/favicon-dark.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
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
