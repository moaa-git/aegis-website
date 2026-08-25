import Image from "next/image";

export type StackedFeature = {
  icon: string;
  title: string;
  body: string;
};

/**
 * Full-width rows: icon tile on the left, title + body to its right.
 *
 * Two treatments, both taken from the comp, and the properties co-vary so
 * they are one prop rather than three:
 *
 *   "gradient"  Endpoint Defense (123:639) — 84px tile carrying a 137.4deg
 *               --color-accent -> --color-primary-deep gradient, 40px glyph,
 *               white title. Used full width.
 *   "tile"      Compliance & eDiscovery columns (142:1104) — flat
 *               --color-tile fill, 48px glyph, heading-toned title. Used at
 *               600px inside TwoColumnList.
 *
 * Measured: 116px tall, --color-surface-row fill, --color-edge-soft border,
 * 16px radius, 20px between rows.
 *
 * The Figma sets these titles in SF Pro Display, the only node family on the
 * interior pages that is not Inter; treated as template debris and set in
 * Inter Display like every other heading. See docs/DEVIATIONS.md.
 *
 * The comp fixes the row at 116px with overflow-clip, which cuts the longer
 * bodies mid-sentence. 116px is a minimum here so copy wraps instead.
 */
export default function StackedFeatureRow({
  features,
  variant = "gradient",
  name,
}: {
  features: StackedFeature[];
  variant?: "gradient" | "tile";
  name?: string;
}) {
  const gradient = variant === "gradient";

  return (
    <div data-verify={name} className="flex flex-col gap-5">
      {features.map((feature) => (
        <article
          key={feature.title}
          className="flex min-h-29 items-center gap-4 rounded-row border border-edge-soft bg-surface-row p-4 sm:gap-6"
        >
          <span
            className={`flex size-21 shrink-0 items-center justify-center rounded-row ${
              gradient
                ? "bg-linear-[137.4deg,var(--color-accent)_4%,var(--color-primary-deep)_100%]"
                : "bg-tile"
            }`}
          >
            <Image
              src={feature.icon}
              alt=""
              width={gradient ? 40 : 48}
              height={gradient ? 40 : 48}
              className={gradient ? "size-10" : "size-12"}
            />
          </span>
          <div className="flex flex-col gap-2">
            <h3
              className={`text-h3 font-medium leading-[1.1] tracking-tight1 ${
                gradient ? "text-white" : "text-heading"
              }`}
            >
              {feature.title}
            </h3>
            <p
              className={`text-base leading-[1.5] ${
                gradient ? "text-white" : "text-white/90"
              }`}
            >
              {feature.body}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
