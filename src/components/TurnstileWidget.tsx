"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback?: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
    }
  ) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare Turnstile, rendered explicitly so the widget's lifetime matches
 * the modal's rather than the page's.
 *
 * Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset; the route
 * handler skips verification in the same case, so the form stays usable on a
 * box with no keys.
 */
export default function TurnstileWidget({
  onToken,
  onError,
}: {
  onToken: (token: string) => void;
  onError: () => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const hostRef = useRef<HTMLDivElement>(null);
  // Held in refs so a re-render never re-runs the effect and re-renders the
  // widget, which would reset a challenge the user has already passed.
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onTokenRef.current = onToken;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!siteKey || !hostRef.current) return;

    let widgetId: string | undefined;
    let cancelled = false;

    const render = () => {
      if (cancelled || !hostRef.current || !window.turnstile) return;
      try {
        widgetId = window.turnstile.render(hostRef.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token) => onTokenRef.current(token),
          "error-callback": () => onErrorRef.current(),
          "expired-callback": () => onTokenRef.current(""),
        });
      } catch {
        onErrorRef.current();
      }
    };

    if (window.turnstile) {
      render();
    } else {
      let script = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = "true";
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
      script.addEventListener("error", () => onErrorRef.current());
    }

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          /* widget already gone */
        }
      }
    };
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={hostRef} data-verify="turnstile" className="mt-5" />;
}
