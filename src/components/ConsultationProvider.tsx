"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import ConsultationModal from "./ConsultationModal";
import type { LeadInput } from "@/lib/consultation-fields";

/** Fields a CTA may preselect when it opens the modal. */
export type ConsultationPrefill = Partial<
  Pick<LeadInput, "primaryInterest" | "engagementPackage">
>;

type Ctx = {
  open: (prefill?: ConsultationPrefill) => void;
  close: () => void;
};

const ConsultationContext = createContext<Ctx | null>(null);

/**
 * Holds the modal for the whole app so any CTA on any page can open it with
 * a prefill, without each page wiring up its own dialog.
 */
export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [prefill, setPrefill] = useState<ConsultationPrefill | null>(null);
  // Bumped on every open so the modal remounts with the new prefill as its
  // initial state, instead of being reset from an effect after render.
  const [session, setSession] = useState(0);

  const open = useCallback((next: ConsultationPrefill = {}) => {
    setSession((n) => n + 1);
    setPrefill(next);
  }, []);
  const close = useCallback(() => setPrefill(null), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <ConsultationContext.Provider value={value}>
      {children}
      {prefill !== null && (
        <ConsultationModal key={session} prefill={prefill} onClose={close} />
      )}
    </ConsultationContext.Provider>
  );
}

export function useConsultation(): Ctx {
  const ctx = useContext(ConsultationContext);
  if (!ctx) {
    throw new Error("useConsultation must be used inside a ConsultationProvider.");
  }
  return ctx;
}
