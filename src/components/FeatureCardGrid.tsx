import Image from "next/image";

export type FeatureCard = {
  icon: string;
  title: string;
  body: string;
  /** Draws the accent border the Figma gives the first card of a grid. */
  highlighted?: boolean;
};

/**
 * Icon + title + body cards on a 2/3/4-column grid.
 *
 * Same card idiom as the landing page's Services section (24px padding, 56px
 * icon tile on --color-tile, 24px title, 16px body, 20px radius, --color-edge
 * border, accent border when highlighted, arrow affordance rotated 53.09deg)
 * minus the feature chips, which the interior pages do not use. Measured off
 * Figma 112:222: 600px cards, 24px gutters, 241px tall.
 *
 * `connector` draws the Union ornament the Figma lays over a 2x2 grid; it is
 * the same artwork the landing page uses and only makes sense at 2 columns.
 */
export default function FeatureCardGrid({
  cards,
  columns = 2,
  connector = false,
  name,
}: {
  cards: FeatureCard[];
  columns?: 2 | 3 | 4;
  connector?: boolean;
  name?: string;
}) {
  const cols = {
    2: "lg:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 xl:grid-cols-4",
  }[columns];

  return (
    <div
      data-verify={name}
      className={`relative grid grid-cols-1 gap-6 ${cols}`}
    >
      {connector && columns === 2 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden bg-[url(/images/services-union.svg)] bg-contain bg-center bg-no-repeat lg:block"
        />
      )}
      {cards.map((card) => (
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
              {card.body}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
