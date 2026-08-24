import Image from "next/image";
import { pricing } from "@/lib/data";

export default function Pricing() {
  return (
    <section id="packages" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-318 px-6 pb-40 pt-40">
        <div className="mx-auto flex max-w-[1006px] flex-col gap-4 text-center">
          <h2 className="text-3xl font-medium tracking-tight3 text-heading md:text-h2">
            {pricing.title}
          </h2>
          <p className="text-lg leading-normal text-white/90">{pricing.subtitle}</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pricing.cards.map((card) => (
            <article
              key={card.name}
              className={`relative flex flex-col rounded-2xl border bg-surface/10 p-8 backdrop-blur-lg ${
                card.popular ? "border-accent" : "border-edge-strong"
              }`}
            >
              {card.popular && (
                <span className="absolute -top-3 left-1/2 flex h-6 -translate-x-1/2 items-center rounded-full bg-accent px-2 text-xs font-medium uppercase whitespace-nowrap text-white">
                  Most Popular
                </span>
              )}
              <span className="flex size-14 items-center justify-center rounded-xl bg-tile">
                <Image src={card.icon} alt="" width={40} height={40} className="size-10" />
              </span>
              <div className="mt-6 flex flex-col gap-1">
                <h3 className="text-h4 font-semibold text-white">{card.name}</h3>
                <p className="text-sm font-medium uppercase leading-[1.2] text-accent">
                  {card.kicker}
                </p>
              </div>
              <p className="mt-6 text-sm leading-[1.2] text-white/70">{card.audience}</p>
              <hr className="mt-7 border-edge" />
              <ul className="mb-10 mt-8 flex flex-col gap-4">
                {card.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Image
                      src="/images/icon-check.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="size-4 shrink-0"
                    />
                    <span className="text-xs leading-[1.2] text-white/90">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`mt-auto flex h-10 items-center justify-center rounded-xl text-sm font-medium text-white ${
                  card.popular
                    ? "bg-linear-to-r from-accent to-primary shadow-btn-primary transition-opacity hover:opacity-90"
                    : "border border-edge transition-colors hover:border-accent"
                }`}
              >
                {card.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
