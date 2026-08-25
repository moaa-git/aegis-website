"use client";

import type { ReactNode } from "react";
import { useConsultation, type ConsultationPrefill } from "./ConsultationProvider";

/**
 * Opens the consultation modal, optionally preselecting a field.
 *
 * Exists so server components (Hero, Services, Pricing, the interior pages)
 * can trigger the modal without themselves becoming client components.
 *
 */
export default function ConsultationButton({
  children,
  className = "",
  prefill,
}: {
  children?: ReactNode;
  className?: string;
  prefill?: ConsultationPrefill;
}) {
  const { open } = useConsultation();

  return (
    <button type="button" onClick={() => open(prefill)} className={className}>
      {children}
    </button>
  );
}
