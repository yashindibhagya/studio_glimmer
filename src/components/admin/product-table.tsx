"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Search, Star, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatLKR } from "@/lib/format";
import { deleteProduct, moveItem, toggleProductFlag } from "@/app/admin/actions";

export function ProductTable({ products, categories }: { products: Product[]; categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  const filtered = useMemo(
    () =>
      products.filter(
        (p) => (!cat || p.categoryId === cat) && (!q || p.name.toLowerCase().includes(q.toLowerCase())),
      ),
    [products, q, cat],
  );
  const reorderable = !q && !cat;

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const res = await fn();
      if (!res.ok && res.error) alert(res.error);
      router.refresh();
    });

  return (
    <div className={pending ? "opacity-70 transition" : "transition"}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="text-muted absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="field !pl-10" />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="field sm:!w-60">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-ivory border-line overflow-hidden rounded-3xl border">
        {filtered.length === 0 && <p className="text-muted p-8 text-center text-sm">No products found.</p>}
        <ul className="divide-line divide-y">
          {filtered.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
              {reorderable && (
                <div className="hidden flex-col sm:flex">
                  <button type="button" disabled={i === 0} onClick={() => run(() => moveItem("products", p.id, -1))} className="text-muted p-0.5 hover:text-bronze disabled:opacity-20" aria-label="Move up"><ArrowUp className="size-3.5" /></button>
                  <button type="button" disabled={i === filtered.length - 1} onClick={() => run(() => moveItem("products", p.id, 1))} className="text-muted p-0.5 hover:text-bronze disabled:opacity-20" aria-label="Move down"><ArrowDown className="size-3.5" /></button>
                </div>
              )}
              <Link href={`/admin/products/${p.id}`} className="bg-blush relative size-14 shrink-0 overflow-hidden rounded-xl sm:size-16">
                {p.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt="" className="size-full object-cover" />
                ) : (
                  <span className="text-rose flex size-full items-center justify-center text-[0.6rem]">No photo</span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/products/${p.id}`} className="text-bronze block truncate font-medium hover:text-rose-deep">
                  {p.name}
                </Link>
                <p className="text-muted truncate text-xs">
                  {catName.get(p.categoryId) ?? "No category"} · {formatLKR(p.price)}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {!p.visible && <Chip tone="stone">Hidden</Chip>}
                  {p.featured && <Chip tone="rose">Featured</Chip>}
                  {p.isNew && <Chip tone="rose">New</Chip>}
                  {!p.inStock && <Chip tone="amber">Made to order</Chip>}
                  {p.sample && <Chip tone="amber">Sample</Chip>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <IconAction label={p.featured ? "Unfeature" : "Feature on homepage"} onClick={() => run(() => toggleProductFlag(p.id, "featured"))}>
                  <Star className={`size-4 ${p.featured ? "fill-rose text-rose" : ""}`} />
                </IconAction>
                <IconAction label={p.visible ? "Hide from website" : "Show on website"} onClick={() => run(() => toggleProductFlag(p.id, "visible"))}>
                  {p.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </IconAction>
                <Link href={`/admin/products/${p.id}`} className="text-bronze hover:bg-blush rounded-full p-2" aria-label="Edit">
                  <Pencil className="size-4" />
                </Link>
                <IconAction
                  label="Delete"
                  onClick={() => confirm(`Delete "${p.name}"? This can't be undone.`) && run(() => deleteProduct(p.id))}
                >
                  <Trash2 className="size-4" />
                </IconAction>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function IconAction({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className="text-bronze hover:bg-blush rounded-full p-2">
      {children}
    </button>
  );
}

function Chip({ tone, children }: { tone: "rose" | "stone" | "amber"; children: React.ReactNode }) {
  const c = { rose: "bg-blush text-rose-deep", stone: "bg-stone-200 text-stone-700", amber: "bg-amber-100 text-amber-900" }[tone];
  return <span className={`rounded-full px-2 py-0.5 text-[0.6rem] tracking-wider uppercase ${c}`}>{children}</span>;
}
