import Image from "next/image";
import { story } from "@/lib/data";

export default function Story() {
  return (
    <section id="story" data-verify="story" className="relative z-10">
      {/* Backdrop photo with fade to surface (Figma 25:8531 + 23:8529).
          The comp's 8px blur is baked into the asset rather than applied as a
          backdrop-filter. The filter was a 2560x763 compositing layer sitting
          directly over the 2155x1496 masked arc below it, and backdrop-filter
          has to snapshot everything painted beneath it on every scroll —
          which is what made the crescent vanish mid-scroll in Chromium.
          See docs/DEVIATIONS.md. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[763px]">
        <div className="absolute inset-0 bg-[url(/images/story-bg.webp)] bg-cover bg-top opacity-90" />
        <div className="absolute inset-0 bg-linear-to-b from-surface/40 to-75% to-surface" />
      </div>
      {/* Background ellipse arc (Figma 32:8667, flipped). Native 2155x1496
          SVG canvas, unclipped so the arc washes into the neighbouring
          sections as in the Figma canvas. */}
      <div
        aria-hidden
        /* The side fade is baked into story-ellipse-faded.svg rather than
           applied as a CSS mask-image. mask-image forced this 2155x1496
           element onto its own render surface, and after a window resize
           Chromium dropped its raster tiles mid-scroll — the crescent
           vanishing behind a hard horizontal edge. Confirmed by the user:
           ?debug=nomask cured it, ?debug=noarc identified this layer.
           Swapping the asset at the breakpoint gives the identical fade with
           no mask at all. See docs/DEVIATIONS.md. */
        className="pointer-events-none absolute -top-[390px] left-1/2 h-[1496px] w-[2155px] -translate-x-1/2 -scale-y-100 bg-[url(/images/story-ellipse.svg)] [background-size:100%_100%] min-[1470px]:bg-[url(/images/story-ellipse-faded.svg)]"
      />
      {/* Horizontal glow streak (Figma 25:8626: a 108x672 blurred ellipse
          rotated 90°; the child renders the SVG's native 308x872 canvas) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-[640px] hidden h-[108px] w-[672px] items-center justify-center lg:flex"
      >
        <div className="h-[872px] w-[308px] shrink-0 rotate-90 bg-[url(/images/story-glow.svg)] [background-size:100%_100%]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-318 grid-cols-1 items-start gap-16 px-6 pb-40 pt-40 lg:grid-cols-[minmax(0,517px)_minmax(0,590px)] lg:justify-between lg:gap-8 lg:pb-71">
        <div className="order-2 rounded-3xl border border-edge bg-linear-to-r from-surface from-5% to-surface/30 p-8 md:p-16 lg:order-1">
          {story.pillars.map((pillar, i) => (
            <div key={pillar.title}>
              {i > 0 && <hr className="my-12 border-edge" />}
              <div className="flex items-center gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-tile">
                  <Image src={pillar.icon} alt="" width={40} height={40} className="size-10" />
                </span>
                <h3 className="text-h3 font-medium text-heading">{pillar.title}</h3>
              </div>
              <p className="mt-6 max-w-[367px] text-base leading-normal tracking-tight2 text-white/90">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-medium leading-[1.2] tracking-tight3 text-heading md:text-h2">
            {story.title[0]}
            <br />
            {story.title[1]}
          </h2>
          <div className="mt-8 flex flex-col gap-7 text-lg leading-normal text-white/90">
            {story.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
