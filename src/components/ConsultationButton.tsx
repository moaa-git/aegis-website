"use client";

import type { ReactNode } from "react";
import { useConsultation, type ConsultationPrefill } from "./ConsultationProvider";

/**
 * Opens the consultation modal, optionally preselecting a field.
 *
 * Exists so server components (Hero, Services, Pricing, the interior pages)
 * can trigger the modal without themselves becoming client components.
 *
 * `overlay` covers its positioned ancestor with a transparent hit target,
 * which is how a whole card is made clickable without adding an element to
 * the card's flow — nothing in the card moves.
 */
export default function ConsultationButton({
  children,
  className = "",
  prefill,
  overlay = false,
  label,
}: {
  children?: ReactNode;
  className?: string;
  prefill?: ConsultationPrefill;
  overlay?: boolean;
  label?: string;
}) {
  const { open } = useConsultation();

  if (overlay) {
    return (
      <button
        type="button"
        onClick={() => open(prefill)}
        data-verify-ignore
        className={`absolute inset-0 rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${className}`}
      >
        <span className="sr-only">{label}</span>
      </button>
    );
  }

  return (
    <button type="button" onClick={() => open(prefill)} className={className}>
      {children}
    </button>
  );
}
