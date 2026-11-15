"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { Sparkle } from "./ornaments";

type ShopProduct = Product & { categoryName?: string };

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function ShopBrowser({
  products,
  categories,
}: {
  products: ShopProduct[];
  categories: Pick<Category, "id" | "slug" | "name">[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "featured";
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    if (params.get("focus") === "search") searchRef.current?.focus();
  }, [params]);

  const update = (next: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString());
    sp.delete("focus");
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Keep the search term in the URL (debounced) so results are shareable.
  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) update({ q });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const activeCat = categories.find((c) => c.slug === category);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (activeCat && p.categoryId !== activeCat.id) return false;
      if (!term) return true;
      return `${p.name} ${p.description} ${p.categoryName ?? ""}`.toLowerCase().includes(term);
    });
    list = [...list];
    if (sort === "new") list.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.createdAt.localeCompare(a.createdAt));
    else if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder);
    return list;
  }, [products, activeCat, q, sort]);

  return (
    <>
      {/* Category pills */}
      <div className="-mx-4 mt-10 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2 sm:mx-auto sm:w-auto sm:flex-wrap sm:justify-center">
          <Pill active={!activeCat} onClick={() => update({ category: "" })}>All</Pill>
          {categories.map((c) => (
            <Pill key={c.id} active={activeCat?.id === c.id} onClick={() => update({ category: c.slug })}>
              {c.name}
            </Pill>
          ))}
        </div>
      </div>

      {/* Search + sort */}
      <div className="border-line mt-8 flex flex-col gap-3 border-y py-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex-1 sm:max-w-sm">
          <span className="sr-only">Search products</span>
          <Search className="text-muted pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" strokeWidth={1.5} />
          <input
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tumblers, phone cases…"
            className="field !rounded-full !py-2.5 !pr-10 !pl-11 !text-sm"
            type="search"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="text-muted absolute top-1/2 right-3 -translate-y-1/2 p-1" aria-label="Clear search">
              <X className="size-4" />
            </button>
          )}
        </label>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <p className="text-muted text-xs tracking-[0.2em] uppercase">
            {results.length} {results.length === 1 ? "piece" : "pieces"}
          </p>
          <label className="flex items-center gap-2">
            <span className="eyebrow">Sort</span>
            <select
              value={sort}
              onChange={(e) => update({ sort: e.target.value === "featured" ? "" : e.target.value })}
              className="field !w-auto !rounded-full !py-2 !text-sm"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Sparkle className="text-rose-light size-8" />
          <p className="font-display text-bronze text-2xl">No pieces found</p>
          <p className="text-muted text-sm">Try another search — or ask us to make it custom!</p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
          {results.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      )}
    </>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-5 py-2.5 text-[0.68rem] tracking-[0.2em] whitespace-nowrap uppercase transition ${
        active ? "bg-bronze border-bronze text-cream" : "border-line text-bronze hover:border-rose"
      }`}
    >
      {children}
    </button>
  );
}
