import Image from "next/image";

export type StackedFeature = {
  icon: string;
  title: string;
  body: string;
};

/**
 * Full-width rows: gradient icon tile on the left, title + body to its right.
 * Used for Endpoint Defense (Figma 123:639) and Network Security (194:273).
 *
 * Measured: 116px tall, --color-surface-row fill, --color-edge-soft border,
 * 16px radius, 20px between rows. The 84px icon tile carries a 137.4deg
 * --color-accent -> --color-primary-deep gradient and a 40px glyph.
 *
 * The Figma sets these titles in SF Pro Display, the only node family on the
 * interior pages that is not Inter; treated as template debris and set in
 * Inter Display like every other heading. See docs/DEVIATIONS.md.
 *
 * Rows are fixed-height at 1440 in the comp but grow with their copy here,
 * so a longer body wraps instead of being clipped.
 */
export default function StackedFeatureRow({
  features,
  name,
}: {
  features: StackedFeature[];
  name?: string;
}) {
  return (
    <div data-verify={name} className="flex flex-col gap-5">
      {features.map((feature) => (
        <article
          key={feature.title}
          className="flex min-h-29 items-center gap-4 rounded-row border border-edge-soft bg-surface-row p-4 sm:gap-6"
        >
          <span className="flex size-21 shrink-0 items-center justify-center rounded-row bg-linear-[137.4deg,var(--color-accent)_4%,var(--color-primary-deep)_100%]">
            <Image
              src={feature.icon}
              alt=""
              width={40}
              height={40}
              className="size-10"
            />
          </span>
          <div className="flex flex-col gap-2">
            <h3 className="text-h3 font-medium leading-[1.1] tracking-tight1 text-white">
              {feature.title}
            </h3>
            <p className="text-base leading-[1.5] text-white">{feature.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
