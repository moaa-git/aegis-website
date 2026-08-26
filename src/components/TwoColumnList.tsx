import StackedFeatureRow, { type StackedFeature } from "./StackedFeatureRow";

export type ListColumn = {
  title: string;
  items: StackedFeature[];
};

/**
 * Two labelled columns of feature rows — "Legal & eDiscovery" beside
 * "Regulatory Frameworks" on Compliance & eDiscovery (Figma 142:1104).
 *
 * The comp's columns are not a list of their own: each row is the same card
 * StackedFeatureRow already draws, at 600px with the flat-tile treatment.
 * So this component is a heading and a gutter, not a second row
 * implementation.
 *
 * Measured: 600px columns with a 24px gutter, 32px column headings, 72px
 * from heading top to the first row.
 */
export default function TwoColumnList({
  columns,
  name,
}: {
  columns: [ListColumn, ListColumn];
  name?: string;
}) {
  return (
    <div data-verify={name} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {columns.map((column) => (
        <div key={column.title}>
          <h3 className="text-2xl font-medium leading-[1.5] tracking-tight3 text-heading md:text-[2rem]">
            {column.title}
          </h3>
          <div className="mt-6">
            <StackedFeatureRow features={column.items} variant="tile" />
          </div>
        </div>
      ))}
    </div>
  );
}
