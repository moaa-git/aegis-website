export type FaqItem = {
  q: string;
  a: readonly string[];
};

/**
 * One group of question/answer disclosures.
 *
 * Native <details open> rather than a React accordion, for the reason the
 * draft gives: every item is expanded in the server-rendered HTML, so the
 * answers are indexable and readable with JavaScript off, and the collapse
 * still works without shipping a client component. There is no JS on this
 * page at all beyond the header and the consultation modal.
 *
 * Surface is the FeatureCardGrid("plain") card — --color-surface-row on an
 * --color-edge-soft border at --radius-row — so the rows read as siblings of
 * the cards on the pillar pages. The marker is an inline chevron rather than
 * the browser's triangle; it is the only rotation on the page and mirrors
 * the 53deg arrow affordance the icon cards already carry.
 */
export default function FaqAccordion({
  items,
  name,
}: {
  items: readonly FaqItem[];
  name?: string;
}) {
  return (
    <div data-verify={name} className="flex flex-col gap-4">
      {items.map((item) => (
        <details
          key={item.q}
          open
          className="group rounded-row border border-edge-soft bg-surface-row px-6 py-5 md:px-8 md:py-6"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 [&::-webkit-details-marker]:hidden">
            <h3 className="text-xl font-medium leading-[1.4] tracking-tight1 text-heading md:text-h3 md:leading-[1.3]">
              {item.q}
            </h3>
            <svg
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
              className="mt-1.5 size-3.5 shrink-0 rotate-90 text-accent transition-transform group-open:-rotate-90"
            >
              <path
                d="M5 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>
          <div className="mt-4 flex flex-col gap-4 text-base leading-[1.6] text-white/90 md:text-lg md:leading-[1.7]">
            {item.a.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
