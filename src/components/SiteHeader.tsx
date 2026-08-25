"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { nav, site } from "@/lib/data";
import { useConsultation } from "./ConsultationProvider";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { open } = useConsultation();

  return (
    <header className="relative z-20 flex w-full items-center justify-between">
      <Link href="/" aria-label={`${site.name} home`} className="shrink-0">
        <Image
          src="/images/logo.png"
          alt={site.name}
          width={138}
          height={48}
          priority
          className="h-12 w-auto"
        />
      </Link>

      {/* Desktop pill nav */}
      <nav className="hidden h-16 w-[760px] items-center justify-between rounded-3xl bg-surface pl-10 pr-2 shadow-nav lg:flex">
        <ul className="flex items-center gap-10 text-lg tracking-tight2">
          {nav.links.map((link, i) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={`transition-colors hover:text-white ${
                  i === 0 ? "text-white" : "text-white/80"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => open()}
          className="flex h-12 items-center rounded-2xl bg-accent px-6 text-lg font-medium text-white shadow-btn-secondary transition-opacity hover:opacity-90"
        >
          {nav.cta.label}
        </button>
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex size-12 flex-col items-center justify-center gap-1.5 rounded-2xl bg-surface shadow-nav lg:hidden"
      >
        <span
          className={`h-0.5 w-6 rounded-full bg-white transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
        />
        <span
          className={`h-0.5 w-6 rounded-full bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`}
        />
        <span
          className={`h-0.5 w-6 rounded-full bg-white transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
        />
      </button>

      {menuOpen && (
        <nav className="absolute inset-x-0 top-full mt-4 rounded-3xl border border-edge bg-surface p-6 shadow-nav lg:hidden">
          <ul className="flex flex-col gap-4 text-lg">
            {nav.links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-white/80 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  open();
                }}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-medium text-white"
              >
                {nav.cta.label}
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
