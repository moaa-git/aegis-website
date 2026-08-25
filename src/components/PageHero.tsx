import Image from "next/image";
import SiteHeader from "./SiteHeader";
import ConsultationButton from "./ConsultationButton";
import type { PillarKey } from "@/lib/data";

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
  eyebrowIcon = "/images/badge-icon.svg",
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  pillar,
  illustration,
  headerGap = 124,
  subtitleWidth = 521,
}: {
  eyebrow: string;
  /** The comp uses a shield on three pages and a brain on AI & Copilot. */
  eyebrowIcon?: string;
  title: string | string[];
  subtitle: string;
  primaryCta: PageHeroCta;
  /** Opens the consultation modal, preselecting this page's pillar. */
  secondaryCta: { label: string };
  pillar: PillarKey;
  illustration: {
    src: string;
    width: number;
    height: number;
    /** Centre offset from the composition centre, in px, per the comp. */
    offsetX: number;
    /** Top offset within the 786px frame, in px, per the comp. */
    top: number;
    /**
     * Optional edge mask. The AI & Copilot artwork (149:377) is masked in
     * the comp by a separate gradient asset that the flattened export does
     * not carry, so its right edge would otherwise stop dead.
     */
    mask?: { image: string; size: string; position: string; composite?: string };
    /**
     * The comp stacks this page's illustration *behind* the hero glow
     * (149:373 precedes the Hero Section) where Endpoint and Compliance put
     * theirs in front. That changes how much the glow lifts the artwork.
     */
    behind?: boolean;
  };
  /**
   * Header-to-content gap. The comp sets this per page rather than deriving
   * it — 124px on Endpoint (112:383), 80px on Compliance (125:795) — because
   * each hero has a different number of H1 lines to seat in the same 786px
   * frame.
   */
  headerGap?: number;
  /** Subhead measure, also set per page in the comp (521px / 574px). */
  subtitleWidth?: number;
}) {
  const lines = Array.isArray(title) ? title : [title];

  return (
    <section
      data-verify="page-hero"
      /* The comp fixes every interior hero frame at 1440x786 with its content
         top-aligned, the lower half being where the illustration sits. Pinning
         the height reproduces that exactly and keeps all four pages identical,
         instead of each one's padding stack landing somewhere near 786. */
      className="relative z-30 overflow-hidden bg-surface lg:min-h-[786px]"
    >
      {/* Background glow (Figma 112:446: 1966x1663 node, SVG canvas 1966x1783
          with the blur padding). Anchored to the composition centre, not the
          window edge, so it holds formation as the viewport widens. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[calc(50%+381.5px)] top-0 z-[1] h-[1783px] w-[1966px] -translate-x-1/2 bg-[url(/images/page-hero-glow.svg)] [background-size:100%_100%] [mask-image:linear-gradient(to_bottom,black_36%,transparent_43%)]"
      />
      {/* Weave overlay (Figma 112:392), same artwork and lattice as the
          landing hero — see .hero-weave in globals.css. */}
      <div
        aria-hidden
        className="hero-weave pointer-events-none absolute inset-x-0 top-0 z-[2] h-[795px] opacity-10"
      />
      {/* Vertical shield strip (Figma 112:386), the landing hero's asset at
          the comp's own x=825 (canvas centre 720 + 105). */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[calc(50%+105px)] top-0 hidden h-[793px] w-[201px] -scale-x-100 bg-[url(/images/hero-shield-column.svg)] bg-contain bg-no-repeat opacity-10 [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_38%,black_62%,transparent),linear-gradient(to_bottom,black_45%,transparent_95%)] lg:block"
      />

      {/* Illustration. Placement comes from each page's own comp node; see
          the offsets in src/lib/pages.ts. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute hidden -translate-x-1/2 lg:block ${
          illustration.behind ? "z-0" : "z-10"
        }`}
        style={{
          width: illustration.width,
          left: `calc(50% + ${illustration.offsetX}px)`,
          top: illustration.top,
          ...(illustration.mask
            ? {
                maskImage: illustration.mask.image,
                maskSize: illustration.mask.size,
                maskPosition: illustration.mask.position,
                maskRepeat: "no-repeat",
                maskComposite: illustration.mask.composite ?? "intersect",
                WebkitMaskImage: illustration.mask.image,
                WebkitMaskSize: illustration.mask.size,
                WebkitMaskPosition: illustration.mask.position,
                WebkitMaskRepeat: "no-repeat",
              }
            : {}),
        }}
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

      <div className="relative z-20 mx-auto w-full max-w-318 px-6 pb-8 pt-7">
        <SiteHeader />

        <div
          className="mt-15 max-w-[702px] pb-24 lg:mt-[var(--hero-gap)] lg:pb-0"
          style={{ "--hero-gap": `${headerGap}px` } as React.CSSProperties}
        >
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-badge border border-white/15 bg-badge px-3 py-2 shadow-badge">
              <Image
                src={eyebrowIcon}
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
          <p
            className="mt-6 text-lg leading-7 text-white/90"
            style={{ maxWidth: subtitleWidth }}
          >
            {subtitle}
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <a
              href={primaryCta.href}
              className="flex h-14 items-center rounded-2xl bg-linear-to-r from-accent to-primary px-6 text-lg font-medium text-white shadow-btn-primary transition-opacity hover:opacity-90"
            >
              {primaryCta.label}
            </a>
            <ConsultationButton
              prefill={{ primaryInterest: pillar }}
              className="flex h-14 items-center rounded-2xl border border-accent-bright bg-surface-row px-6 text-lg font-medium text-white shadow-btn-secondary transition-colors hover:bg-surface-row/70"
            >
              {secondaryCta.label}
            </ConsultationButton>
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
            data-hero-stacked
            className="pointer-events-none mx-auto mt-12 hidden h-auto w-full max-w-[420px] sm:block lg:hidden"
          />
        </div>
      </div>
    </section>
  );
}
