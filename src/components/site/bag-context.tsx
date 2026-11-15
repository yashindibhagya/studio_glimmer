"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { BagLine } from "@/lib/format";

type BagState = {
  lines: BagLine[];
  wishlist: string[]; // product ids
  ready: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (line: Omit<BagLine, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  toggleWish: (productId: string) => void;
};

const BagContext = createContext<BagState | null>(null);
const BAG_KEY = "sg-bag-v1";
const WISH_KEY = "sg-wish-v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) — bag still works for this visit */
  }
}

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<BagLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Restore after hydration so server and client markup match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(load(BAG_KEY, []));
    setWishlist(load(WISH_KEY, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) save(BAG_KEY, lines);
  }, [lines, ready]);
  useEffect(() => {
    if (ready) save(WISH_KEY, wishlist);
  }, [wishlist, ready]);

  const add = useCallback<BagState["add"]>((line, qty = 1) => {
    const key = [line.productId, JSON.stringify(line.options), line.personalization ?? ""].join("|");
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
      return [...prev, { ...line, key, qty }];
    });
    setOpen(true);
  }, []);

  const value = useMemo<BagState>(
    () => ({
      lines,
      wishlist,
      ready,
      open,
      setOpen,
      add,
      setQty: (key, qty) =>
        setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(99, qty)) } : l))),
      removeLine: (key) => setLines((prev) => prev.filter((l) => l.key !== key)),
      clear: () => setLines([]),
      toggleWish: (id) =>
        setWishlist((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id])),
    }),
    [lines, wishlist, ready, open, add],
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used inside <BagProvider>");
  return ctx;
}
