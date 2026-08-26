import Image from "next/image";
import Link from "next/link";
import { services, pillarPages, type PillarKey } from "@/lib/data";

export default function Services() {
  return (
    <section id="services" data-verify="services" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-318 px-6 pt-40">
        <div className="mx-auto flex max-w-[1006px] flex-col gap-4 text-center">
          <h2 className="text-3xl font-medium tracking-tight3 text-heading md:text-h2">
            {services.title}
          </h2>
          <p className="text-lg leading-normal text-white/90">{services.subtitle}</p>
        </div>

        <div className="relative mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Connector ornament between the cards (Figma 36:8910 "Union") */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden bg-[url(/images/services-union.svg)] bg-contain bg-center bg-no-repeat lg:block"
          />
          {services.cards.map((card) => (
            <article
              key={card.title}
              className={`relative rounded-card border p-6 ${
                card.highlighted ? "border-accent" : "border-edge"
              }`}
            >
              <span className="flex size-14 items-center justify-center rounded-xl bg-tile">
                <Image src={card.icon} alt="" width={40} height={40} className="size-10" />
              </span>
              <span
                aria-hidden
                className="absolute right-6 top-6 flex size-10 items-center justify-center"
              >
                <Image
                  src="/images/icon-arrow.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 rotate-[53deg]"
                />
              </span>
              <div className="mt-4 flex flex-col gap-2">
                <h3 className="text-h3 font-medium text-heading">{card.title}</h3>
                <p className="text-base leading-normal tracking-tight2 text-white/90">
                  {card.description}
                </p>
              </div>
              {/* Whole-card hit target. Absolutely positioned so nothing in
                  the card's flow moves, and marked verify-ignore so the
                  harness does not count a transparent overlay as painted
                  content when it measures inter-band whitespace. */}
              <Link
                href={pillarPages[card.interest as PillarKey].href}
                data-verify-ignore
                className="absolute inset-0 rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <span className="sr-only">{`${card.title} — read more`}</span>
              </Link>
              <ul className="mt-5 flex flex-wrap items-center gap-3">
                {card.chips.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full bg-chip px-5 py-2 text-tag whitespace-nowrap text-white/50"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
