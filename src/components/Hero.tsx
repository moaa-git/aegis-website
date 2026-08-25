import Image from "next/image";
import SiteHeader from "./SiteHeader";
import ConsultationButton from "./ConsultationButton";
import { hero } from "@/lib/data";

export default function Hero() {
  return (
    <section
      data-verify="hero"
      className="relative z-30 overflow-hidden bg-surface"
    >
      {/* Swirl background (Figma 1:7909; SVG canvas 2155x1996 = node 1966
          plus blur padding, centred on the page like the node).
          The artwork runs 1996px tall while the hero clips at 788, and at
          that line it is still lifting the surface by ~7/255 — so the clip
          left a hard full-width edge. The Figma frame has the identical
          step (its hero clipsContent too), so this bottom fade is a
          deliberate departure from the comp; see docs/DEVIATIONS.md.
          32%/38.5% of 1996 = a 639→768px ramp, landing the layer at zero
          ~20px before the clip. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[1996px] w-[2155px] -translate-x-1/2 bg-[url(/images/hero-swirl-fadeY.svg)] [background-size:100%_100%] min-[1470px]:bg-[url(/images/hero-swirl-fadeXY.svg)]"
      />
      {/* Faint weave overlay (Figma 1:7855). Full-bleed at the artwork's own
          density — see .hero-weave in globals.css for the lattice maths. */}
      <div
        aria-hidden
        className="hero-weave pointer-events-none absolute inset-x-0 top-0 h-[795px] opacity-10"
      />
      {/* Carries the shield's glow the last ~50px to the section boundary.
          Only at >=1440, where the shield is locked at its natural 959x784
          (bottom edge 786) so the graft point is fixed; below that the image
          scales down and its glow ends higher, where no tail is wanted. */}
      <div
        aria-hidden
        className="hero-aura-tail pointer-events-none absolute left-[calc(50%+240.5px)] top-[640px] hidden h-[148px] w-[820px] -translate-x-1/2 min-[1440px]:block"
      />
      {/* Vertical shield strip (Figma 1:7849, flipped, 10% opacity). Pinned
          to the composition at the comp's x=825 (canvas centre 720, so
          50% + 105px), not to the window edge — otherwise it drifts away
          from the shield as the viewport widens. Its outermost stroke sits
          hard on the container edge; in the comp that stroke is muted by the
          photo's dark backdrop behind it, which no longer exists now that
          the photo carries real alpha, so the edges are faded here instead. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[calc(50%+105px)] top-0 hidden h-[793px] w-[201px] -scale-x-100 bg-[url(/images/hero-shield-column.svg)] bg-contain bg-no-repeat opacity-10 [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_38%,black_62%,transparent),linear-gradient(to_bottom,black_45%,transparent_95%)] lg:block"
      />
      {/* Masked shield photo (Figma 6:8328). Left edge pinned at the comp's
          x=481 with width 100vw-481px, so it scales continuously with the
          hero from lg up to 1440, where it lands exactly on the locked
          composition (left = 50% - 239px, natural size) with no jump.
          The edge fade hides the reconstructed-alpha haze boundary. */}
      <Image
        src="/images/hero-shield.webp"
        alt=""
        aria-hidden
        width={959}
        height={784}
        priority
        className="pointer-events-none absolute hidden max-w-none lg:left-[max(481px,calc(50%-239px))] lg:top-1/2 lg:block lg:h-auto lg:w-[min(959px,calc(100vw-481px))] lg:-translate-y-1/2 lg:max-[1439px]:[mask-image:radial-gradient(closest-side,black_70%,transparent_100%)] min-[1440px]:[mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
      />

      <div className="relative mx-auto w-full max-w-318 px-6 pb-8 pt-7">
        <SiteHeader />

        <div className="mt-20 max-w-[702px] pb-24 lg:pb-38">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-badge border border-white/15 bg-badge px-3 py-2 shadow-badge">
              <Image
                src="/images/badge-icon.svg"
                alt=""
                width={16}
                height={16}
                className="size-4 opacity-85"
              />
              <span className="text-sm font-semibold uppercase leading-[22px] text-white">
                {hero.badge}
              </span>
            </span>
            <h1 className="text-4xl font-semibold tracking-tight3 text-heading md:text-display">
              {hero.title}
            </h1>
          </div>
          <p className="mt-6 max-w-[702px] text-lg leading-7 text-white/90">
            {hero.subtitle}
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <a
              href={hero.primaryCta.href}
              className="flex h-14 items-center rounded-2xl bg-linear-to-r from-accent to-primary px-6 text-lg font-medium text-white shadow-btn-primary transition-opacity hover:opacity-90"
            >
              {hero.primaryCta.label}
            </a>
            <ConsultationButton className="flex h-14 items-center rounded-2xl bg-surface-raised px-6 text-lg font-medium text-white shadow-btn-secondary transition-colors hover:bg-surface-raised/70">
              {hero.secondaryCta.label}
            </ConsultationButton>
          </div>
          {/* Stacked shield between sm and lg. Hidden below sm: on a phone
              it dropped onto its own line under the CTAs and read as a
              second, disconnected block rather than part of the hero. */}
          <Image
            src="/images/hero-shield.webp"
            alt=""
            aria-hidden
            width={959}
            height={784}
            data-hero-stacked
            className="pointer-events-none mx-auto mt-12 hidden h-auto w-full max-w-[480px] sm:block lg:hidden"
          />
        </div>
      </div>
    </section>
  );
}
