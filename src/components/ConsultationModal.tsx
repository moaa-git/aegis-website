"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  CONTACT_PREFERENCES,
  EMPTY_LEAD,
  SELECTS,
  validateLead,
  type LeadErrors,
  type LeadInput,
} from "@/lib/consultation-fields";
import type { ConsultationPrefill } from "./ConsultationProvider";
import TurnstileWidget from "./TurnstileWidget";

type Status = "idle" | "submitting" | "success" | "error";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Focus ring that stays legible on the dark surface. */
const RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const FIELD =
  `w-full rounded-xl border border-edge bg-surface-row px-4 py-3 text-base text-white placeholder:text-white/40 transition-colors hover:border-edge-strong ${RING}`;

export default function ConsultationModal({
  prefill,
  onClose,
}: {
  prefill: ConsultationPrefill | null;
  onClose: () => void;
}) {
  // The provider remounts this component per open, so the CTA's prefill is
  // the initial state rather than something an effect patches in afterwards.
  const [values, setValues] = useState<LeadInput>(() => ({
    ...EMPTY_LEAD,
    ...prefill,
  }));
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");
  const [token, setToken] = useState("");
  const [turnstileFailed, setTurnstileFailed] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const handleToken = useCallback((t: string) => {
    setToken(t);
    setTurnstileFailed(false);
  }, []);
  const handleTurnstileError = useCallback(() => setTurnstileFailed(true), []);
  // Verification is still running: hold the submit rather than let it fail
  // server-side. If the widget errors outright, submit is released again so
  // a Cloudflare problem cannot lock someone out of the form entirely.
  const awaitingVerification = Boolean(siteKey) && !token && !turnstileFailed;

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  // Move focus into the dialog, and remember where to put it back.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  // Lock the page behind the dialog, and put focus back where it came from.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      restoreFocusRef.current?.focus?.();
    };
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Focus trap: cycle within the dialog rather than escaping to the page
      // behind it, which is still rendered and still focusable.
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const list = [...nodes].filter((n) => n.offsetParent !== null);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  const set = (key: keyof LeadInput) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    // Clear a field's error as soon as the user edits it; re-validation
    // happens on submit.
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateLead(values);
    if (Object.keys(found).length) {
      setErrors(found);
      setStatus("error");
      setFormError("Check the highlighted fields.");
      const firstKey = Object.keys(found)[0];
      dialogRef.current
        ?.querySelector<HTMLElement>(`[name="${firstKey}"]`)
        ?.focus();
      return;
    }

    setStatus("submitting");
    setFormError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, turnstileToken: token }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        errors?: LeadErrors;
      };
      if (res.ok && data.ok) {
        setStatus("success");
        return;
      }
      if (data.errors) setErrors(data.errors);
      setStatus("error");
      setFormError(
        data.error ?? "Something went wrong. Please try again, or email contact@aegisascent.com."
      );
    } catch {
      setStatus("error");
      setFormError(
        "Could not reach the server. Please try again, or email contact@aegisascent.com."
      );
    }
  }

  const pending = status === "submitting";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={onKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        data-verify="consultation-modal"
        /* No auto margins here: inside a scrolling flex container they centre
           the dialog by pushing its overflow above the scroll origin, putting
           the title and close button out of reach on a short viewport. */
        className="w-full max-w-[640px] rounded-card border border-edge-strong bg-surface p-6 shadow-btn-secondary sm:p-8"
      >
        {status === "success" ? (
          <div data-verify="consultation-success" className="py-6 text-center">
            <h2 id={titleId} className="text-h3 font-medium text-heading">
              Request received
            </h2>
            <p id={descId} className="mt-3 text-base leading-normal text-white/90">
              Thanks — we&apos;ll be in touch within one business day. If it&apos;s
              urgent, email{" "}
              <a
                href="mailto:contact@aegisascent.com"
                className={`text-accent-bright underline ${RING}`}
              >
                contact@aegisascent.com
              </a>
              .
            </p>
            <button
              type="button"
              onClick={onClose}
              className={`mt-8 h-12 rounded-2xl bg-linear-to-r from-accent to-primary px-6 text-base font-medium text-white shadow-btn-primary ${RING}`}
            >
              Close
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={submit}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-h3 font-medium text-heading">
                  Request a consultation
                </h2>
                <p id={descId} className="mt-1 text-sm leading-normal text-white/70">
                  Fixed-scope, fixed-price. We reply within one business day.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={`-mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl text-2xl leading-none text-white/70 transition-colors hover:bg-surface-row hover:text-white ${RING}`}
              >
                <span aria-hidden>&times;</span>
              </button>
            </div>

            {/* Honeypot: off-screen, untabbable, and unlabelled for humans. */}
            <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={(e) => set("website")(e.target.value)}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" name="fullName" error={errors.fullName} required>
                <input
                  ref={firstFieldRef}
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  className={FIELD}
                  value={values.fullName}
                  onChange={(e) => set("fullName")(e.target.value)}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
              </Field>

              <Field label="Work email" name="workEmail" error={errors.workEmail} required>
                <input
                  id="workEmail"
                  name="workEmail"
                  type="email"
                  autoComplete="email"
                  className={FIELD}
                  value={values.workEmail}
                  onChange={(e) => set("workEmail")(e.target.value)}
                  aria-invalid={Boolean(errors.workEmail)}
                  aria-describedby={errors.workEmail ? "workEmail-error" : undefined}
                />
              </Field>

              <Field label="Company / firm name" name="company" error={errors.company} required>
                <input
                  id="company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  className={FIELD}
                  value={values.company}
                  onChange={(e) => set("company")(e.target.value)}
                  aria-invalid={Boolean(errors.company)}
                  aria-describedby={errors.company ? "company-error" : undefined}
                />
              </Field>

              <Field label="Phone" name="phone" error={errors.phone} hint="Optional">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className={FIELD}
                  value={values.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
              </Field>

              {SELECTS.map((field) => (
                <Field
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  error={errors[field.name]}
                >
                  <select
                    id={field.name}
                    name={field.name}
                    className={FIELD}
                    value={values[field.name]}
                    onChange={(e) => set(field.name)(e.target.value)}
                    aria-invalid={Boolean(errors[field.name])}
                  >
                    <option value="">Select…</option>
                    {field.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>

            <div className="mt-4">
              <Field
                label="What do you need?"
                name="needs"
                error={errors.needs}
                required
              >
                <textarea
                  id="needs"
                  name="needs"
                  rows={4}
                  className={`${FIELD} resize-y`}
                  value={values.needs}
                  onChange={(e) => set("needs")(e.target.value)}
                  aria-invalid={Boolean(errors.needs)}
                  aria-describedby={errors.needs ? "needs-error" : undefined}
                />
              </Field>
            </div>

            <fieldset className="mt-4">
              <legend className="text-sm font-medium text-white/90">
                Preferred contact
              </legend>
              <div className="mt-2 flex gap-3">
                {CONTACT_PREFERENCES.map((o) => (
                  <label
                    key={o.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-base transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-bright has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface ${
                      values.preferredContact === o.value
                        ? "border-accent bg-surface-row text-white"
                        : "border-edge text-white/70 hover:border-edge-strong"
                    }`}
                  >
                    <input
                      type="radio"
                      name="preferredContact"
                      value={o.value}
                      checked={values.preferredContact === o.value}
                      onChange={(e) => set("preferredContact")(e.target.value)}
                      className="size-4 accent-accent focus-visible:outline-none"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
              {errors.preferredContact && (
                <p className="mt-1.5 text-sm text-red-300">{errors.preferredContact}</p>
              )}
            </fieldset>

            <TurnstileWidget onToken={handleToken} onError={handleTurnstileError} />

            {turnstileFailed && (
              <p className="mt-3 text-sm text-white/70">
                Bot verification could not load. You can still submit — or email{" "}
                <a
                  href="mailto:contact@aegisascent.com"
                  className={`text-accent-bright underline ${RING}`}
                >
                  contact@aegisascent.com
                </a>
                .
              </p>
            )}

            {formError && (
              <p
                role="alert"
                data-verify="consultation-form-error"
                className="mt-5 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                {formError}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={pending || awaitingVerification}
                className={`flex h-12 items-center rounded-2xl bg-linear-to-r from-accent to-primary px-6 text-base font-medium text-white shadow-btn-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${RING}`}
              >
                {pending
                  ? "Sending…"
                  : awaitingVerification
                    ? "Verifying…"
                    : "Request consultation"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`flex h-12 items-center rounded-2xl border border-edge px-6 text-base font-medium text-white/80 transition-colors hover:border-edge-strong hover:text-white ${RING}`}
              >
                Cancel
              </button>
              <p className="text-sm text-white/50">We never share your details.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-white/90">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-accent-bright">
            *
          </span>
        )}
        {hint && <span className="ml-2 font-normal text-white/50">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
