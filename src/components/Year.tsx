"use client";

// Client-evaluated so the copyright year stays current without a rebuild;
// the prerendered value is corrected on hydration (hence the suppression).
export default function Year() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
