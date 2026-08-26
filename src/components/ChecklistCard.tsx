import Image from "next/image";
import type { ReactNode } from "react";

/**
 * The bordered promise panel — "Defensible by Design" on Compliance &
 * eDiscovery (Figma 131:526 / 138:1100).
 *
 * Measured off the comp: 1224x597 panel on --color-surface-row with a
 * --color-edge-accent border and a 32px radius, 70px padding, an eyebrow
 * chip, a 48px heading, a body paragraph whose second sentence is set
 * semibold, then five checkmark rows at 20px with a 24px filled check and
 * 20px between them.
 */
export default function ChecklistCard({
  eyebrow,
  title,
  body,
  items,
  name,
}: {
  eyebrow?: string;
  title: string;
  body?: ReactNode;
  items: string[];
  name?: string;
}) {
  return (
    <div
      data-verify={name}
      className="rounded-panel border border-edge-accent bg-surface-row p-8 md:p-12 lg:p-[70px]"
    >
      {eyebrow && (
        <span className="inline-flex w-fit items-center justify-center rounded-badge border-[0.2px] border-white/15 bg-badge px-3 py-2 shadow-badge">
          <span className="text-sm font-semibold uppercase leading-[22px] text-white">
            {eyebrow}
          </span>
        </span>
      )}
      <h2 className="mt-2 text-3xl font-medium tracking-tight3 text-heading md:text-h2">
        {title}
      </h2>
      {body && (
        <div className="mt-8 text-lg leading-7 text-white/90">{body}</div>
      )}
      <ul className="mt-6.5 flex flex-col gap-5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3">
            <Image
              src="/images/icon-check-fill.svg"
              alt=""
              width={24}
              height={24}
              className="size-6 shrink-0"
            />
            <span className="text-lg leading-[1.5] text-white md:text-xl">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
