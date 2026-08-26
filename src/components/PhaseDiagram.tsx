import Image from "next/image";
import AgreementDivider from "./AgreementDivider";

export type PhaseNode = {
  number: number;
  icon: string;
  title: string;
  body: string;
};

export type DiagramRow =
  | { type: "phases"; nodes: PhaseNode[] }
  | { type: "agreement"; label: string };

/**
 * The five-phase engagement diagram with its two agreement dividers.
 *
 * Drawn entirely from the existing system: each node is the
 * StackedFeatureRow / FeatureCardGrid("plain") card surface — --color-surface-row
 * on an --color-edge-soft border at --radius-row — carrying the same
 * size-14 --color-tile icon tile the Services cards and the Story pillars
 * use, with a glyph already present in /public/images. No new asset, no new
 * icon style, and no hover state, because neither sibling component has one.
 *
 * Structure is CSS and inline SVG only. Connectors are the --color-mist/15
 * hairline the PartnerBadgeStrip and the footer rules use; the chevrons are
 * inline paths in --color-accent. The two agreement dividers come from
 * AgreementDivider, which swaps that hairline for --color-edge-accent so they
 * read as interruptions in the flow rather than steps in it.
 *
 * Layout: rows stack vertically at every width. A row holding two phases
 * sits them side by side with a horizontal connector at lg and collapses to
 * the same vertical stepper as everything else below it — the lg breakpoint
 * FeatureCardGrid and TwoColumnList already collapse at.
 */

/**
 * Solid arrowhead, 12x10 pointing right, rotated for the vertical runs.
 *
 * A filled head rather than the old open chevron, and the runs it caps are
 * 2px of --color-accent at 45% rather than a 1px --color-mist/15 hairline:
 * at a glance the sequence has to read as one directed flow, and the hairline
 * was quiet enough that the cards looked like an unordered grid.
 *
 * This is still a connector, not an agreement divider — those stay 1px
 * --color-edge-accent running the full width of the diagram, so the two are
 * separated by colour, weight, length and orientation.
 */
function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 10"
      aria-hidden
      className={`h-2.5 w-3 shrink-0 text-accent ${className ?? ""}`}
    >
      <path d="M12 5L0 10V0z" fill="currentColor" />
    </svg>
  );
}

/** Vertical run between two rows. */
function StepConnector() {
  return (
    <div aria-hidden className="flex flex-col items-center py-4">
      <span className="h-8 w-0.5 rounded-full bg-accent/45" />
      <Arrow className="-mt-px rotate-90" />
    </div>
  );
}

/** Between two phases in the same row: horizontal at lg, vertical below. */
function InlineConnector() {
  return (
    <div
      aria-hidden
      className="flex flex-col items-center justify-center py-3 lg:flex-row lg:px-4 lg:py-0"
    >
      <span className="h-8 w-0.5 rounded-full bg-accent/45 lg:h-0.5 lg:w-8" />
      <Arrow className="-mt-px rotate-90 lg:mt-0 lg:-ml-px lg:rotate-0" />
    </div>
  );
}

function Node({ node }: { node: PhaseNode }) {
  return (
    <article className="relative flex h-full flex-col rounded-row border border-edge-soft bg-surface-row p-6">
      {/*
        The step number as a numeral in its own ring, in the corner the
        Services cards give their arrow affordance. It replaces the small
        "PHASE 1" label that used to sit above the title: a numeral reads as
        an ordinal from across the page where 13px uppercase does not, which
        is the whole job here. The word "Phase" is not lost — the body
        section for each step still carries it as its eyebrow chip.
      */}
      <span
        aria-hidden
        className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border border-edge-accent bg-badge text-lg font-semibold leading-none text-accent-bright shadow-badge"
      >
        {node.number}
      </span>
      <div className="flex items-center gap-4 pr-14">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-tile">
          <Image src={node.icon} alt="" width={40} height={40} className="size-10" />
        </span>
        <h3 className="text-h3 font-medium leading-[1.1] tracking-tight1 text-heading">
          <span className="sr-only">Phase {node.number}: </span>
          {node.title}
        </h3>
      </div>
      <p className="mt-4 text-base leading-[1.5] text-white/90">{node.body}</p>
    </article>
  );
}

export default function PhaseDiagram({
  rows,
  name,
}: {
  rows: DiagramRow[];
  name?: string;
}) {
  return (
    <div data-verify={name} className="flex flex-col">
      {rows.map((row, i) => (
        <div key={i} className="contents">
          {i > 0 && <StepConnector />}
          {row.type === "agreement" ? (
            <AgreementDivider label={row.label} />
          ) : (
            <div
              className={
                row.nodes.length > 1
                  ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
                  : "mx-auto w-full lg:max-w-[600px]"
              }
            >
              {row.nodes.map((node, j) => (
                <div key={node.number} className="contents">
                  {j > 0 && <InlineConnector />}
                  <Node node={node} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
