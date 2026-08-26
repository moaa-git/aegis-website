import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import LegalTableOfContents, { tocFromBlocks } from "./LegalTableOfContents";
import { formatLastUpdated, type Block, type Inline, type LegalDoc } from "@/lib/legal";

/**
 * Shared shell for /privacy and /terms.
 *
 * Deliberately quieter than the marketing pages: site header, a clause rail,
 * one column of prose, site footer. No hero, no partner badges, no background
 * artwork — these are 4,500-word documents and the typography is the only
 * thing doing any work.
 *
 * The document column is 936px at xl: the 1224px container less the 232px
 * clause rail and its 56px gutter. It was 1082px before the rail — the design's
 * widest running-text block (StackedFeatureRow copy on Endpoint and
 * Compliance) — and 936px is still inside the site's own measures.
 *
 * The rail is xl and up, not lg. At 1024 the container is only 976px, so the
 * split would leave a 688px column and make a 15,000px document meaningfully
 * taller for no navigational gain that the collapsed disclosure does not
 * already provide. Below xl the grid collapses, the document runs the full
 * container width exactly as it did before the rail, and the section list is
 * the "Jump to a section" disclosure above it.
 *
 * Colours, type sizes and radii are the existing tokens: --color-heading for
 * headings, --color-accent-bright for links, --text-h3 / --text-h4 for the
 * section and subsection headings (the 48px --text-h2 is a marketing size
 * and would be absurd across 23 numbered sections).
 */

function renderInline(nodes: Inline[], keyPrefix = ""): React.ReactNode {
  return nodes.map((node, i) => {
    const key = `${keyPrefix}${i}`;
    switch (node.type) {
      case "text":
        return <span key={key}>{node.value}</span>;
      case "break":
        return <br key={key} />;
      case "strong":
        return (
          <strong key={key} className="font-semibold text-white">
            {renderInline(node.children, `${key}-`)}
          </strong>
        );
      case "em":
        return <em key={key}>{renderInline(node.children, `${key}-`)}</em>;
      case "link":
        return (
          <a
            key={key}
            href={node.href}
            // Termly's own links open in a new tab; anchors within the
            // document must not.
            {...(/^https?:/.test(node.href)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="text-accent-bright underline decoration-accent-bright/40 underline-offset-2 transition-colors hover:text-white hover:decoration-white/60"
          >
            {renderInline(node.children, `${key}-`)}
          </a>
        );
    }
  });
}

function renderBlock(block: Block, key: string) {
  switch (block.type) {
    case "heading": {
      // h1 is the document title and is rendered as page chrome, so anything
      // reaching here starts at h2.
      const Tag = (`h${Math.max(2, block.level)}` as "h2" | "h3");
      const styles =
        block.level <= 2
          ? "mt-14 text-h3 font-semibold text-heading first:mt-0"
          : "mt-10 text-h4 font-semibold text-heading first:mt-0";
      return (
        <Tag key={key} id={block.id} className={`scroll-mt-8 ${styles}`}>
          {renderInline(block.children, `${key}-`)}
        </Tag>
      );
    }

    case "paragraph":
      return (
        <p key={key} className="mt-5 first:mt-0">
          {renderInline(block.children, `${key}-`)}
        </p>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          key={key}
          className={`mt-5 flex flex-col gap-2 pl-6 first:mt-0 ${
            block.ordered ? "list-decimal" : "list-disc"
          } marker:text-accent`}
        >
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              {renderInline(item.children, `${key}-${i}-`)}
              {item.sublist && (
                <ul className="mt-2 flex flex-col gap-2 pl-6 list-[circle] marker:text-accent">
                  {item.sublist.map((sub, j) => (
                    <li key={j} className="pl-1">
                      {renderInline(sub.children, `${key}-${i}-${j}-`)}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </Tag>
      );
    }

    case "table":
      return (
        // The category table is three columns of prose and cannot compress
        // to 342px. It scrolls inside its own bounded box so the page never
        // scrolls sideways; the min-width is what forces that scroll rather
        // than letting the columns collapse to two words each.
        <div
          key={key}
          data-verify="legal-table"
          // Focusable and labelled so the horizontal scroll is reachable
          // from the keyboard and announced, not just by touch drag.
          role="region"
          aria-label="Categories of personal information we collect"
          tabIndex={0}
          className="mt-6 overflow-x-auto rounded-row border border-edge first:mt-0"
        >
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-chip text-left">
                {block.head.map((cell, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="border-b border-edge px-4 py-3 font-semibold text-heading"
                  >
                    {renderInline(cell, `${key}-h${i}-`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-edge/60 last:border-b-0">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 align-top leading-relaxed">
                      {renderInline(cell, `${key}-${i}-${j}-`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  // The document opens with its own <h1> and a "Last updated" line. Both are
  // promoted into the page masthead -- rendering them twice would put the
  // same date on screen two paragraphs apart.
  const blocks = [...doc.blocks];
  const first = blocks[0];
  const h1 = first?.type === "heading" && first.level === 1 ? first : null;
  if (h1) blocks.shift();
  const second = blocks[0];
  if (
    second?.type === "paragraph" &&
    /^\s*Last updated\b/i.test(inlineText(second.children))
  ) {
    blocks.shift();
  }

  const toc = tocFromBlocks(blocks);

  return (
    <>
      <main className="overflow-x-clip">
        <section data-verify="legal" className="bg-surface">
          <div className="mx-auto w-full max-w-318 px-6 pb-30 pt-7">
            <SiteHeader contactHref="/#contact" />

            {/* Two columns at lg: the clause rail, then the document. The
                masthead spans both so its rule runs the full width.

                The running-text measure was 1082px -- the design's own widest,
                the StackedFeatureRow copy on Endpoint and Compliance. The rail
                takes 232px plus a 56px gutter out of the 1224px container, so
                the column is now 936px. Still one of the site's own measures
                and a slightly easier line length for a 4,500-word document;
                the change is the rail's cost, not a redesign. Below lg the
                grid collapses and the document is full width exactly as
                before. */}
            <div className="mt-16 md:mt-20 xl:grid xl:grid-cols-[232px_minmax(0,1fr)] xl:gap-14">
              <header
                data-verify="legal-masthead"
                className="border-b border-mist/15 pb-8 xl:col-span-2"
              >
                <h1 className="text-4xl font-semibold tracking-tight3 text-heading md:text-[2.75rem] md:leading-[1.15]">
                  {h1 ? renderInline(h1.children, "title-") : doc.title}
                </h1>
                <p data-verify="legal-updated" className="mt-4 text-base text-white/60">
                  Last updated {formatLastUpdated(doc.lastUpdated)}
                </p>
              </header>

              <LegalTableOfContents items={toc} variant="rail" />

              <div className="min-w-0 xl:mt-10">
                <div className="mt-10 xl:mt-0">
                  <LegalTableOfContents items={toc} variant="disclosure" />
                </div>
                <div
                  data-verify="legal-body"
                  className="text-base leading-[1.75] text-white/75 md:text-lg md:leading-[1.8]"
                >
                  {blocks.map((block, i) => renderBlock(block, `b${i}`))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter badges={false} contactHref="/#contact" />
    </>
  );
}

/** Flattened text of an inline tree, for the masthead check above. */
function inlineText(nodes: Inline[]): string {
  return nodes
    .map((n) =>
      n.type === "text" ? n.value : n.type === "break" ? " " : inlineText(n.children)
    )
    .join("");
}
