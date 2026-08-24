import Image from "next/image";

/**
 * Bordered card with an eyebrow, a heading, and checkmark bullets.
 * Used for "OUR PROMISE" / "Defensible by Design" on Compliance &
 * eDiscovery (Figma 131:526).
 *
 * Structure follows the landing page's card idiom (--color-edge border,
 * 20px radius, 24px title) with the pricing section's checkmark bullet
 * treatment. Geometry is trued against the Figma node in Phase 6a — this
 * component is built here so the page is assembled from shared parts rather
 * than forked, but it has not yet been measured against its own frame.
 */
export default function ChecklistCard({
  eyebrow,
  title,
  items,
  name,
}: {
  eyebrow?: string;
  title: string;
  items: string[];
  name?: string;
}) {
  return (
    <div
      data-verify={name}
      className="rounded-card border border-edge bg-surface-row/40 p-8 md:p-12"
    >
      {eyebrow && (
        <span className="inline-flex w-fit items-center justify-center rounded-badge border-[0.2px] border-white/15 bg-badge px-3 py-2 shadow-badge">
          <span className="text-sm font-semibold uppercase leading-[22px] text-white">
            {eyebrow}
          </span>
        </span>
      )}
      <h2 className="mt-4 text-3xl font-medium tracking-tight3 text-heading md:text-h2">
        {title}
      </h2>
      <ul className="mt-8 flex flex-col gap-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <Image
              src="/images/icon-check.svg"
              alt=""
              width={16}
              height={16}
              className="mt-1.5 size-4 shrink-0"
            />
            <span className="text-base leading-normal tracking-tight2 text-white/90">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
