"use client";

import { useEffect } from "react";

/**
 * Temporary diagnostic for the crescent-disappearing-on-scroll report.
 *
 * Driven by a URL query parameter so it needs no devtools console:
 *
 *   ?debug=outline   outline every decorative layer in its own colour
 *   ?debug=nomask    strip mask-image from every decorative layer
 *   ?debug=promote   pin every decorative layer to its own GPU layer
 *   ?debug=noclip    drop the horizontal clip on <main>
 *   ?debug=noarc     hide the Story arc only
 *
 * Mounted only outside production (see layout.tsx) and inert with no
 * parameter. Delete once the cause is identified.
 */
const COLOURS = ["red", "lime", "cyan", "magenta", "yellow", "orange", "white", "deepskyblue"];
const MODES = "outline · nomask · promote · noclip · noarc";

/** Read during render, like Year.tsx does — hence suppressHydrationWarning. */
function currentMode(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("debug");
}

export default function ScrollDebug() {
  const mode = currentMode();

  useEffect(() => {
    if (!mode) return;

    // React double-invokes effects in dev, so clear any labels from a prior
    // pass before adding this one's.
    document.querySelectorAll("[data-debug-tag]").forEach((t) => t.remove());

    const layers = [...document.querySelectorAll<HTMLElement>("[aria-hidden]")].filter(
      (e) => e.offsetWidth > 200 && e.offsetHeight > 200
    );

    layers.forEach((el, i) => {
      const colour = COLOURS[i % COLOURS.length];
      if (mode === "outline") {
        el.style.outline = `2px solid ${colour}`;
        el.style.outlineOffset = "-2px";
        const r = el.getBoundingClientRect();
        const tag = document.createElement("div");
        tag.dataset.debugTag = "1";
        tag.textContent =
          `${i + 1} ${colour} · ${Math.round(r.width)}x${Math.round(r.height)}`;
        tag.style.cssText =
          `position:absolute;top:0;left:0;z-index:99998;background:${colour};color:#000;` +
          `font:11px/1.4 ui-monospace,monospace;padding:1px 5px;pointer-events:none`;
        el.appendChild(tag);
      }
      if (mode === "nomask") {
        el.style.maskImage = "none";
        el.style.webkitMaskImage = "none";
      }
      if (mode === "promote") el.style.willChange = "transform";
      if (mode === "noarc" && el.className.includes("top-[390px]")) {
        el.style.display = "none";
      }
    });

    if (mode === "noclip") {
      const main = document.querySelector("main");
      if (main) main.style.overflowX = "visible";
    }
  }, [mode]);

  if (!mode) return null;

  return (
    <div
      suppressHydrationWarning
      style={{
        position: "fixed",
        left: 12,
        bottom: 12,
        zIndex: 99999,
        padding: "8px 12px",
        borderRadius: 10,
        background: "rgba(0,0,0,.86)",
        color: "#deefff",
        font: "12px/1.5 ui-monospace, monospace",
        border: "1px solid #4084c1",
        pointerEvents: "none",
      }}
    >
      <strong style={{ color: "#51a6f3" }}>debug: {mode}</strong>
      <div style={{ marginTop: 4, opacity: 0.7 }}>{MODES}</div>
    </div>
  );
}
