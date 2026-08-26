import Image from "next/image";
import { expertise } from "@/lib/data";

function TrustIcon({ icon }: { icon: string }) {
  // Figma composes these tiles from a circle + glyph pair (19:8349 subtree);
  // the first tile is a single glyph.
  if (icon === "location") {
    return (
      <Image
        src="/images/icon-shield.svg"
        alt=""
        width={40}
        height={40}
        className="size-10"
      />
    );
  }
  const glyph = icon === "check" ? "/images/icon-check-o.svg" : "/images/icon-document.svg";
  return (
    <span className="relative flex size-10 items-center justify-center">
      <Image
        src="/images/icon-circle.svg"
        alt=""
        width={31}
        height={31}
        className="absolute size-8"
      />
      <Image
        src={glyph}
        alt=""
        width={icon === "check" ? 30 : 20}
        height={icon === "check" ? 30 : 24}
        className={icon === "check" ? "relative size-7" : "relative h-6 w-5"}
      />
    </span>
  );
}

export default function Expertise() {
  return (
    <section data-verify="expertise" className="relative z-20">
      {/* Radial glow arc (Figma 19:8347, flipped). Rendered at the SVG's
          native 2155x885 canvas (node box + blur padding) and left unclipped
          so it bleeds across the section boundary; the hero above (higher z,
          opaque fill) covers its far end exactly as the Figma z-order does. */}
      <div
        aria-hidden
        /* Side fade baked into the asset, not a CSS mask — same reason as the
           Story arc; see Story.tsx and docs/DEVIATIONS.md. */
        className="pointer-events-none absolute -top-[317px] left-1/2 h-[885px] w-[2155px] -translate-x-1/2 -scale-y-100 bg-[url(/images/glow-ellipse.svg)] [background-size:100%_100%] min-[1470px]:bg-[url(/images/glow-ellipse-faded.svg)]"
      />

      <div className="relative mx-auto w-full max-w-318 px-6 pt-40">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center">
          <span className="flex size-30 shrink-0 items-center justify-center rounded-2xl border-[10px] border-primary/20 bg-primary">
            <Image
              src="/images/icon-shield-lg.svg"
              alt=""
              width={80}
              height={80}
              className="size-20"
            />
          </span>
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-medium tracking-tight3 text-heading md:text-h2">
              {expertise.title}
            </h2>
            <p className="max-w-[1006px] text-lg leading-normal text-white/90">
              {expertise.body}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-y border-line py-6 md:flex-row md:items-center md:justify-between">
          {expertise.trust.map((item, i) => (
            <div key={item.label} className="contents">
              {i > 0 && <span className="hidden h-20 w-px bg-line md:block" aria-hidden />}
              <div className="flex w-full items-center gap-2 md:w-[262px]">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-tile">
                  <TrustIcon icon={item.icon} />
                </span>
                <span className="max-w-40 text-base font-semibold uppercase leading-[1.6] tracking-tight2 text-white">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
