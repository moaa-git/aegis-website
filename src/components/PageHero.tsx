import Image from "next/image";
import SiteHeader from "./SiteHeader";

export type PageHeroCta = { label: string; href: string };

/**
 * Interior-page hero: eyebrow chip, H1, subhead, two CTAs, and an
 * illustration slot on the right. Measured off Figma 112:379 (Endpoint
 * Management & Security); 125:794, 149:218 and 164:725 are the same frame
 * with different copy and artwork.
 *
 * Geometry from the comp: 786px tall, 28px top padding, 124px from the
 * header to the content, 16px eyebrow-to-H1, 24px H1-to-subhead, 48px
 * subhead-to-CTAs. The subhead is held to 521px, the H1 to 702px.
 *
 * Two differences from the landing hero, both from the comp rather than
 * invented: the eyebrow icon is 20px here (16px there), and the secondary
 * CTA is --color-surface-row with an --color-accent-bright border instead of
 * --color-surface-raised with none.
 *
 * The background glow is masked to reach zero ~18px above the section's
 * bottom edge. The hero clips at 786 while the artwork runs 1783px tall, so
 * without the fade it would be cut mid-tone and leave the same hard seam
 * that Phase 2 removed from the landing hero.
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  illustration,
}: {
  eyebrow: string;
  title: string | string[];
  subtitle: string;
  primaryCta: PageHeroCta;
  secondaryCta: PageHeroCta;
  illustration: { src: string; width: number; height: number };
}) {
  const lines = Array.isArray(title) ? title : [title];

  return (
    <section
      data-verify="page-hero"
      className="relative z-30 overflow-hidden bg-surface"
    >
      {/* Background glow (Figma 112:446: 1966x1663 node, SVG canvas 1966x1783
          with the blur padding). Anchored to the composition centre, not the
          window edge, so it holds formation as the viewport widens. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[calc(50%+381.5px)] top-0 h-[1783px] w-[1966px] -translate-x-1/2 bg-[url(/images/page-hero-glow.svg)] [background-size:100%_100%] [mask-image:linear-gradient(to_bottom,black_36%,transparent_43%)]"
      />
      {/* Weave overlay (Figma 112:392), same artwork and lattice as the
          landing hero — see .hero-weave in globals.css. */}
      <div
        aria-hidden
        className="hero-weave pointer-events-none absolute inset-x-0 top-0 h-[795px] opacity-10"
      />
      {/* Vertical shield strip (Figma 112:386), the landing hero's asset at
          the comp's own x=825 (canvas centre 720 + 105). */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[calc(50%+105px)] top-0 hidden h-[793px] w-[201px] -scale-x-100 bg-[url(/images/hero-shield-column.svg)] bg-contain bg-no-repeat opacity-10 [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_38%,black_62%,transparent),linear-gradient(to_bottom,black_45%,transparent_95%)] lg:block"
      />

      {/* Illustration (Figma 119:598 on the Endpoint frame): comp x=849,
          y=195, so its centre sits 361.5px right of the composition centre. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[calc(50%+361.5px)] top-[195px] hidden -translate-x-1/2 lg:block"
        style={{ width: illustration.width }}
      >
        <Image
          src={illustration.src}
          alt=""
          width={illustration.width}
          height={illustration.height}
          priority
          className="h-auto w-full"
        />
      </div>

      <div className="relative mx-auto w-full max-w-318 px-6 pb-8 pt-7">
        <SiteHeader />

        <div className="mt-15 max-w-[702px] pb-24 lg:mt-31 lg:pb-38">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-badge border border-white/15 bg-badge px-3 py-2 shadow-badge">
              <Image
                src="/images/badge-icon.svg"
                alt=""
                width={20}
                height={20}
                className="size-5 opacity-85"
              />
              <span className="text-sm font-semibold uppercase leading-[22px] text-white">
                {eyebrow}
              </span>
            </span>
            <h1 className="text-4xl font-semibold tracking-tight3 text-heading md:text-display">
              {lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </div>
          <p className="mt-6 max-w-[521px] text-lg leading-7 text-white/90">
            {subtitle}
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <a
              href={primaryCta.href}
              className="flex h-14 items-center rounded-2xl bg-linear-to-r from-accent to-primary px-6 text-lg font-medium text-white shadow-btn-primary transition-opacity hover:opacity-90"
            >
              {primaryCta.label}
            </a>
            <a
              href={secondaryCta.href}
              className="flex h-14 items-center rounded-2xl border border-accent-bright bg-surface-row px-6 text-lg font-medium text-white shadow-btn-secondary transition-colors hover:bg-surface-row/70"
            >
              {secondaryCta.label}
            </a>
          </div>
          {/* Below lg the illustration stacks under the text rather than
              disappearing with the nav, the same call the landing hero makes
              for its shield. */}
          <Image
            src={illustration.src}
            alt=""
            aria-hidden
            width={illustration.width}
            height={illustration.height}
            className="pointer-events-none mx-auto mt-12 h-auto w-full max-w-[420px] lg:hidden"
          />
        </div>
      </div>
    </section>
  );
}
