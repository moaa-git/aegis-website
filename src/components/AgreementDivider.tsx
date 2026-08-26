/**
 * The point in the flow where something gets signed: a rule spanning the
 * full width with a single label sitting on it.
 *
 * The idiom is PartnerBadgeStrip's — content flanked by two hairlines — with
 * the rule swapped from --color-mist/15 to --color-edge-accent. That is what
 * keeps it reading as an interruption rather than a step: the connectors
 * between phases keep the mist hairline, so the two never read as the same
 * kind of line.
 *
 * The label is bare text, not a chip. A chip reads as another node in the
 * sequence, which is the opposite of what this divider is for.
 *
 * Type is the eyebrow ramp — 14px semibold uppercase, no letter-spacing.
 * --text-tag carries -0.02em and Chromium's subpixel rounding of that on a
 * short uppercase string opens a visible gap mid-word.
 */
export default function AgreementDivider({
  label,
  name,
}: {
  label: string;
  name?: string;
}) {
  return (
    <div data-verify={name} className="flex items-center gap-4 sm:gap-6">
      <span aria-hidden className="h-px flex-1 bg-edge-accent" />
      <span className="text-sm font-semibold uppercase leading-[22px] text-accent-bright">
        {label}
      </span>
      <span aria-hidden className="h-px flex-1 bg-edge-accent" />
    </div>
  );
}
