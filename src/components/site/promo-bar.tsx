"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const KEY = "sg-promo-dismissed";

export function PromoBar({ text }: { text: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      // Dismissal is remembered per promo message, so a new promo shows again.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (sessionStorage.getItem(KEY) === text) setHidden(true);
    } catch {
      /* ignore */
    }
  }, [text]);

  if (hidden || !text) return null;
  return (
    <div className="bg-bronze text-cream relative px-10 py-2.5 text-center text-[0.68rem] tracking-[0.22em] uppercase">
      {text}
      <button
        type="button"
        onClick={() => {
          setHidden(true);
          try {
            sessionStorage.setItem(KEY, text);
          } catch {
            /* ignore */
          }
        }}
        className="absolute top-1/2 right-3 -translate-y-1/2 p-1 opacity-70 hover:opacity-100"
        aria-label="Dismiss announcement"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
