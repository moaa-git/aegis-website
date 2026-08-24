import Image from "next/image";

/**
 * The Sophos Silver Partner credential, centred between two hairlines.
 *
 * Lives inside SiteFooter on every page — that is where the Figma puts it,
 * in each page's own footer frame, not as a standalone band above it. Kept
 * as its own component so the strip can be lifted out if a page ever needs
 * it on its own.
 *
 * The Figma row duplicates the badge and carries a single hairline on the
 * right; see docs/DEVIATIONS.md for why one badge and symmetric rules.
 */
export default function PartnerBadgeStrip() {
  return (
    <div data-verify="partner-badge-strip" className="flex items-center gap-8">
      <span aria-hidden className="h-px flex-1 bg-mist/15" />
      <Image
        src="/images/sophos-silver-partner.png"
        alt="Sophos Silver Partner"
        width={573}
        height={134}
        className="h-24 w-auto md:h-[134px]"
      />
      <span aria-hidden className="h-px flex-1 bg-mist/15" />
    </div>
  );
}
