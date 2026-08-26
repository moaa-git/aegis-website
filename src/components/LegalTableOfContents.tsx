import type { Block } from "@/lib/legal";

export type TocItem = { id: string; label: string };

/**
 * Short rail labels, keyed by the anchor id Termly emits.
 *
 * The document's own headings are long and set in caps — "3. WHEN AND WITH
 * WHOM DO WE SHARE YOUR PERSONAL INFORMATION?" is four wrapped lines of
 * shouting in a 232px rail. These are the same sections named for scanning.
 *
 * Unmapped ids fall back to the heading's own text with its leading number
 * stripped, so a section Termly adds later still appears in the rail — just
 * with its full title. Safe across a re-sync: this file is not touched by
 * scripts/legal-convert.mjs. See docs/BACKLOG.md.
 */
const LABELS: Record<string, string> = {
  // privacy
  infocollect: "Information We Collect",
  infouse: "How We Process It",
  whoshare: "When & With Whom We Share",
  cookies: "Cookies & Tracking",
  inforetain: "How Long We Keep It",
  infosafe: "How We Keep It Safe",
  infominors: "Information From Minors",
  privacyrights: "Your Privacy Rights",
  DNT: "Do-Not-Track",
  uslaws: "US Residents' Rights",
  policyupdates: "Updates to This Notice",
  request: "Review, Update or Delete",
  // terms
  services: "Our Services",
  ip: "Intellectual Property",
  userreps: "User Representations",
  prohibited: "Prohibited Activities",
  ugc: "User Contributions",
  license: "Contribution License",
  thirdparty: "Third-Party Content",
  sitemanage: "Services Management",
  ppyes: "Privacy Policy",
  terms: "Term & Termination",
  modifications: "Modifications",
  law: "Governing Law",
  disputes: "Dispute Resolution",
  corrections: "Corrections",
  disclaimer: "Disclaimer",
  liability: "Limitations of Liability",
  indemnification: "Indemnification",
  userdata: "User Data",
  electronic: "Electronic Communications",
  california: "California Users",
  misc: "Miscellaneous",
  addclause: "Terms vs. Engagements",
  // both documents end with this one
  contact: "Contact Us",
};

/** Flattened text of an inline tree. */
function inlineText(nodes: { type: string; value?: string; children?: unknown[] }[]): string {
  return nodes
    .map((n) =>
      n.type === "text"
        ? n.value ?? ""
        : n.type === "break"
          ? " "
          : inlineText((n.children ?? []) as Parameters<typeof inlineText>[0])
    )
    .join("");
}

/**
 * Every level-2 heading that carries an anchor, in document order.
 *
 * `#toc` is dropped: it is the document's own table of contents, and a link
 * to it from the rail is a link to a duplicate of the rail. The two lead
 * sections ("SUMMARY OF KEY POINTS", "AGREEMENT TO OUR LEGAL TERMS") carry no
 * anchor from Termly and so are not linkable; they sit at the top of the
 * document, above where the rail's first target lands.
 */
export function tocFromBlocks(blocks: Block[]): TocItem[] {
  const out: TocItem[] = [];
  for (const b of blocks) {
    if (b.type !== "heading" || b.level !== 2 || !b.id || b.id === "toc") continue;
    const raw = inlineText(b.children as Parameters<typeof inlineText>[0]).trim();
    out.push({ id: b.id, label: LABELS[b.id] ?? raw.replace(/^\d+\.\s*/, "") });
  }
  return out;
}

function List({ items }: { items: TocItem[] }) {
  return (
    <ol className="flex flex-col gap-0.5">
      {items.map((item, i) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="group/link flex gap-2.5 rounded-lg px-3 py-2 text-sm leading-[1.45] text-white/70 transition-colors hover:bg-surface-row hover:text-white focus-visible:bg-surface-row focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright"
          >
            {/* white/60, not /40: at 40% over --color-surface the numeral measures
                3.83:1 and fails AA. /60 is 7.06:1. */}
            <span className="shrink-0 tabular-nums text-white/60 transition-colors group-hover/link:text-accent-bright">
              {i + 1}.
            </span>
            <span>{item.label}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * The clause rail on /privacy and /terms.
 *
 * Rendered twice, and deliberately: a sticky rail in the left column at xl
 * and up, and a closed <details> disclosure above the document below it.
 * A single element cannot be open at one breakpoint and collapsed at another
 * without JavaScript, and these two pages ship none — the same call the FAQ
 * accordion makes. The markup cost is one duplicated list of links.
 *
 * No scroll-spy for the same reason. The rail is anchors only: it works with
 * JavaScript off, costs nothing at runtime, and every target already carries
 * `scroll-mt-8` so a jumped-to clause is not flush against the viewport top.
 */
export default function LegalTableOfContents({
  items,
  variant,
}: {
  items: TocItem[];
  variant: "rail" | "disclosure";
}) {
  if (!items.length) return null;

  if (variant === "disclosure") {
    return (
      <details
        data-verify="legal-toc-disclosure"
        className="group/toc mb-10 rounded-row border border-edge-soft bg-surface-row px-4 xl:hidden"
      >
        {/* py-3 sits on the summary, not the details: the padding has to be
            inside the click target or the control is only 24px tall. */}
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3.5 text-base font-semibold text-heading [&::-webkit-details-marker]:hidden">
          Jump to a section
          <svg
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
            className="size-3.5 shrink-0 rotate-90 text-accent transition-transform group-open/toc:-rotate-90"
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
        <nav aria-label="Document sections" className="-mx-1 pb-3">
          <List items={items} />
        </nav>
      </details>
    );
  }

  return (
    <nav
      data-verify="legal-toc"
      aria-label="Document sections"
      /* self-start is what makes position:sticky work inside a grid row —
         a stretched grid item is already as tall as the row and never
         travels. The scroll cap keeps a 23-clause rail usable on a short
         laptop viewport. */
      className="hidden xl:block xl:self-start xl:sticky xl:top-8 xl:max-h-[calc(100vh-4rem)] xl:overflow-y-auto xl:pr-2"
    >
      <p className="px-3 pb-3 text-tag font-semibold uppercase tracking-normal text-white/60">
        On this page
      </p>
      <List items={items} />
    </nav>
  );
}
