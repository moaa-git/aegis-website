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
 *
 * Still the Figma-derived placeholder. The official asset supplied on
 * 2026-08-25 (Sophos-Partners-Silver.png) is the light-background variant:
 * its wordmark is rgba(0,26,71) and every opaque pixel of it measures below
 * luminance 80, which is invisible on the #0c1428 footer. Swap it in as soon
 * as the reversed/white version arrives — it is otherwise the better asset
 * (real transparency, 1201x281 rather than 573x134).
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
