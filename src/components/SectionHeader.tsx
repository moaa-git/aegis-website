import type { ReactNode } from "react";

/**
 * Small uppercase eyebrow chip + H2, with an optional subhead.
 *
 * Measured off Figma 112:218 (centred, "Microsoft Intune" / "Device
 * Management") and 123:608 (left-aligned, "Choose Your Stack" / "Endpoint
 * Defense"): the two alignments are the same component, so alignment is a
 * prop rather than a fork. Eyebrow-to-heading gap is 6px in both.
 *
 * The eyebrow chip is the hero badge treatment without its icon slot.
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  subtitleWidth,
  name,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  /** Subhead measure in px; the comp sets 624 on Comprehensive Compliance. */
  subtitleWidth?: number;
  name?: string;
}) {
  const centered = align === "center";
  return (
    <div
      data-verify={name ? `${name}-header` : undefined}
      className={`flex w-full max-w-[1006px] flex-col gap-1.5 ${
        centered ? "mx-auto items-center text-center" : "items-start text-left"
      }`}
    >
      {eyebrow && (
        <span className="inline-flex w-fit items-center justify-center rounded-badge border-[0.2px] border-white/15 bg-badge px-3 py-2 shadow-badge">
          <span className="text-sm font-semibold uppercase leading-[22px] text-white">
            {eyebrow}
          </span>
        </span>
      )}
      <h2 className="text-3xl font-medium tracking-tight3 text-heading md:text-h2">
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-[7px] text-lg leading-normal text-white/90"
          style={subtitleWidth ? { maxWidth: subtitleWidth } : undefined}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
