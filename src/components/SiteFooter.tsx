import Image from "next/image";
import { footer, site } from "@/lib/data";
import Year from "./Year";
import PartnerBadgeStrip from "./PartnerBadgeStrip";

export default function SiteFooter() {
  return (
    <footer
      id="contact"
      data-verify="footer"
      className="relative overflow-hidden bg-surface-deep"
    >

      <div className="relative mx-auto w-full max-w-318 px-6 pb-19 pt-20">
        <PartnerBadgeStrip />

        <div className="mt-15 flex flex-col gap-12 lg:flex-row lg:gap-[103px]">
          <div className="relative max-w-[289px]">
            {/* Soft glow behind the logo block (Figma 43:20: 63x64 ellipse,
                blur 150; SVG canvas 363x364 placed at the node's offset) */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-[102px] left-[101px] hidden h-[364px] w-[363px] bg-[url(/images/footer-glow.svg)] [background-size:100%_100%] lg:block"
            />
            <Image
              src="/images/logo.png"
              alt={site.name}
              width={161}
              height={56}
              className="h-14 w-auto"
            />
            <p className="mt-3 text-base leading-normal tracking-tight1 text-white/70">
              {footer.blurb}
            </p>
            <ul className="mt-5 flex flex-col gap-4">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-2.5 text-base leading-[1.4] tracking-tight2 text-white/70 transition-colors hover:text-white"
                >
                  <Image src="/images/icon-mail.svg" alt="" width={20} height={20} className="size-5" />
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.phoneHref}
                  className="flex items-center gap-2.5 text-base leading-[1.4] tracking-tight2 text-white/70 transition-colors hover:text-white"
                >
                  <Image src="/images/icon-call.svg" alt="" width={20} height={20} className="size-5" />
                  {site.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-base leading-[1.4] tracking-tight2 text-white/70">
                <Image src="/images/icon-city.svg" alt="" width={20} height={20} className="size-5" />
                {site.location}
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:gap-[103px]">
            {footer.columns.map((column) => (
              <nav key={column.title} aria-label={column.title} className="w-full max-w-[186px]">
                <h3 className="text-xl font-medium leading-[1.6] text-heading">{column.title}</h3>
                <ul className="mt-4 flex flex-col gap-4">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-base leading-[1.6] text-white/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-mist/15 pt-5">
          <div className="flex flex-col gap-4 text-sm leading-normal text-white/70 md:flex-row md:items-center md:justify-between">
            <p>
              © <Year /> Aegis Ascent. All rights reserved.
            </p>
            <div className="flex gap-10">
              {footer.legalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
