import Image from "next/image";

export type Credential = {
  icon: string;
  label: string;
};

/**
 * Certifications and partnerships as a horizontal strip.
 *
 * The reference is the landing page's "Expertise You Can Talk To" trust row
 * (Expertise.tsx): a 56px --color-tile icon tile beside a label, items
 * separated by --color-line vertical rules, the whole run bounded by a
 * --color-line rule top and bottom. Four across at desktop, two-by-two at
 * tablet, stacked at phone.
 *
 * One departure from that row, and it is forced by the copy: its three
 * labels are two-word chips set in uppercase ("US-BASED EXECUTION"), while
 * these are full credential names — "Microsoft 365 Certified: Security
 * Administrator Associate (MS-500)" in uppercase would be four lines of
 * shouting. Same size and weight, sentence case. See docs/DEVIATIONS.md.
 *
 * The rules are drawn as left borders rather than as sibling spans so they
 * follow the grid at every breakpoint: at two columns only the right-hand
 * cell of each row carries one, at four columns every cell but the first.
 */
export default function CredentialStrip({
  items,
  name,
}: {
  items: readonly Credential[];
  name?: string;
}) {
  return (
    <div
      data-verify={name}
      className="grid grid-cols-1 gap-y-8 border-y border-line py-8 md:grid-cols-2 md:gap-y-10 lg:grid-cols-4 lg:gap-y-0"
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`flex items-center gap-4 border-line md:px-6 lg:px-6 ${
            i % 2 === 1 ? "md:border-l" : ""
          } ${i > 0 ? "lg:border-l" : "lg:pl-0"} ${
            i === items.length - 1 ? "lg:pr-0" : ""
          }`}
        >
          <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-tile">
            <Image src={item.icon} alt="" width={40} height={40} className="size-10" />
          </span>
          <span className="text-base font-semibold leading-[1.5] tracking-tight2 text-white">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
