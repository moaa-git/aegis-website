export type PanelCell = {
  title: string;
  body: string;
};

/**
 * One bordered panel split into equal columns by vertical rules — "Core
 * Readiness Deliverables" on AI & Copilot Readiness (Figma 152:437).
 *
 * Not a card grid: the comp draws a single --color-edge-panel border around
 * the whole row and separates the cells with 124px rules rather than giving
 * each cell its own box. Measured: 1224px panel, 16px radius, 392px cells,
 * 40px cell padding, 24px between a cell's title and body.
 *
 * The rules are hidden below md, where the cells stack and a vertical rule
 * between stacked rows would read as a mistake.
 */
export default function DividedPanel({
  cells,
  horizontalFrom = "md",
  name,
}: {
  cells: PanelCell[];
  /**
   * Breakpoint at which the cells go side by side; below it they stack and
   * the rules are hidden, which is the treatment described above.
   *
   * "md" is the comp's own panel, measured at two and three cells. A fourth
   * cell does not fit there -- at 768px each cell would be 192px wide, 128px
   * of it inside the 40px padding -- so the four-cell panel on AI & Copilot
   * Readiness waits for "xl", where the 1272px container still gives every
   * cell a readable measure.
   */
  horizontalFrom?: "md" | "xl";
  name?: string;
}) {
  const row = {
    md: "md:flex-row md:divide-y-0",
    xl: "xl:flex-row xl:divide-y-0",
  }[horizontalFrom];
  const rule = { md: "md:block", xl: "xl:block" }[horizontalFrom];

  return (
    <div
      data-verify={name}
      className={`flex flex-col divide-y divide-edge-panel rounded-row border border-edge-panel ${row}`}
    >
      {cells.map((cell, i) => (
        <div key={cell.title} className="relative flex-1 p-8 lg:p-10">
          {/* The comp's rules are 124px tall inside a 172px panel, inset from
              both borders rather than running the full cell height. */}
          {i > 0 && (
            <span
              aria-hidden
              className={`absolute left-0 top-1/2 hidden h-[124px] w-px -translate-y-1/2 bg-edge-panel ${rule}`}
            />
          )}
          <h3 className="text-h3 font-medium leading-[1.1] tracking-tight1 text-heading">
            {cell.title}
          </h3>
          <p className="mt-6 text-base leading-[1.5] text-white/90">{cell.body}</p>
        </div>
      ))}
    </div>
  );
}
