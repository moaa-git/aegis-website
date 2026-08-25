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
  name,
}: {
  cells: PanelCell[];
  name?: string;
}) {
  return (
    <div
      data-verify={name}
      className="flex flex-col divide-y divide-edge-panel rounded-row border border-edge-panel md:flex-row md:divide-y-0"
    >
      {cells.map((cell, i) => (
        <div key={cell.title} className="relative flex-1 p-8 lg:p-10">
          {/* The comp's rules are 124px tall inside a 172px panel, inset from
              both borders rather than running the full cell height. */}
          {i > 0 && (
            <span
              aria-hidden
              className="absolute left-0 top-1/2 hidden h-[124px] w-px -translate-y-1/2 bg-edge-panel md:block"
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
