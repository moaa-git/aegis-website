import Image from "next/image";

export type FeatureCard = {
  /** Optional: the "plain" variant draws no icon. */
  icon?: string;
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
 * Two treatments from the comp. "icon" is the Endpoint/landing card: 24px
 * padding, 56px icon tile, arrow affordance, 20px radius, --color-edge
 * border, transparent fill. "plain" is the AI & Copilot card (156:579):
 * no icon and no arrow, 32px padding, 16px radius, --color-edge-soft border
 * on a --color-surface-row fill, and 16px between title and body.
 *
 * `connector` draws the Union ornament the Figma lays over a 2x2 grid; it is
 * the same artwork the landing page uses and only makes sense at 2 columns.
 */
export default function FeatureCardGrid({
  cards,
  columns = 2,
  connector = false,
  variant = "icon",
  name,
}: {
  cards: FeatureCard[];
  columns?: 2 | 3 | 4;
  connector?: boolean;
  variant?: "icon" | "plain";
  name?: string;
}) {
  const plain = variant === "plain";
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
          /* 241px is the comp's icon-card height (112:223), 178px the plain
             card's (156:579). Minimums rather than fixed heights so longer
             copy grows the card instead of overflowing it. */
          className={
            plain
              ? "rounded-row border border-edge-soft bg-surface-row p-8 lg:min-h-[178px]"
              : `relative rounded-card border p-6 lg:min-h-[241px] ${
                  card.highlighted ? "border-accent" : "border-edge"
                }`
          }
        >
          {!plain && card.icon && (
            <span className="flex size-14 items-center justify-center rounded-xl bg-tile">
              <Image src={card.icon} alt="" width={40} height={40} className="size-10" />
            </span>
          )}
          {!plain && (
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
          )}
          <div className={plain ? "flex flex-col gap-4" : "mt-4 flex flex-col gap-2"}>
            <h3
              className={
                plain
                  ? "text-h3 font-medium leading-[1.1] tracking-tight1 text-heading"
                  : "text-h3 font-medium text-heading"
              }
            >
              {card.title}
            </h3>
            <p
              className={
                plain
                  ? "text-base leading-[1.5] text-white/90"
                  : "text-base leading-normal tracking-tight2 text-white/90"
              }
            >
              {card.body}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
