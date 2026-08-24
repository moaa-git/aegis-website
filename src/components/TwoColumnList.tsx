import Image from "next/image";

export type ListColumn = {
  title: string;
  items: { title: string; body?: string }[];
};

/**
 * Two labelled columns of rows, used for "Comprehensive Compliance
 * Solutions" on Compliance & eDiscovery (Figma 142:1105): a Legal &
 * eDiscovery column beside a Regulatory Frameworks column.
 *
 * Collapses to a single column below md. Geometry is trued against the
 * Figma node in Phase 6a; built here so the page composes from shared parts.
 */
export default function TwoColumnList({
  columns,
  name,
}: {
  columns: [ListColumn, ListColumn];
  name?: string;
}) {
  return (
    <div data-verify={name} className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {columns.map((column) => (
        <div
          key={column.title}
          className="rounded-card border border-edge bg-surface-row/40 p-6 md:p-8"
        >
          <h3 className="text-h3 font-medium text-heading">{column.title}</h3>
          <ul className="mt-6 flex flex-col gap-5">
            {column.items.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <Image
                  src="/images/icon-check.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="mt-1.5 size-4 shrink-0"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-base font-medium leading-normal tracking-tight2 text-white">
                    {item.title}
                  </span>
                  {item.body && (
                    <span className="text-sm leading-normal text-white/70">
                      {item.body}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
