"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Loader2, Plus, Trash2, X } from "lucide-react";
import type { Product, ProductOption } from "@/lib/types";
import { saveProduct, type ProductInput } from "@/app/admin/actions";
import { ImageUploader } from "./image-uploader";
import { VideoUploader } from "./video-uploader";
import { Card, Toggle } from "./ui";

export function ProductForm({ product, categories }: { product?: Product; categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState({
    name: product?.name ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    price: product ? String(product.price) : "",
    compareAtPrice: product?.compareAtPrice ? String(product.compareAtPrice) : "",
    description: product?.description ?? "",
    images: product?.images ?? [],
    videos: product?.videos ?? [],
    options: product?.options ?? ([] as ProductOption[]),
    personalizable: product?.personalizable ?? false,
    personalizationLabel: product?.personalizationLabel ?? "",
    featured: product?.featured ?? false,
    isNew: product?.isNew ?? true,
    inStock: product?.inStock ?? true,
    visible: product?.visible ?? true,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setSaved(false);
    setF((s) => ({ ...s, [k]: v }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const input: ProductInput = {
      ...f,
      id: product?.id,
      price: f.price,
      compareAtPrice: f.compareAtPrice ? f.compareAtPrice : null,
      options: f.options
        .map((o) => ({ name: o.name.trim(), values: o.values.map((v) => v.trim()).filter(Boolean) }))
        .filter((o) => o.name && o.values.length),
    };
    start(async () => {
      const res = await saveProduct(input);
      if (!res.ok) {
        setError(res.error ?? "Could not save");
        return;
      }
      setSaved(true);
      if (!product) router.replace(`/admin/products/${res.id}`);
      else router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <Card className="space-y-5">
          <label className="block">
            <span className="field-label">Product name *</span>
            <input className="field" value={f.name} onChange={(e) => set("name", e.target.value)} required maxLength={120} />
          </label>
          <label className="block">
            <span className="field-label">Description</span>
            <textarea className="field min-h-32" value={f.description} onChange={(e) => set("description", e.target.value)} maxLength={4000} />
          </label>
        </Card>

        <Card>
          <ImageUploader value={f.images} onChange={(v) => set("images", v)} folder="products" />
        </Card>

        <Card>
          <VideoUploader value={f.videos} onChange={(v) => set("videos", v)} />
        </Card>

        <Card className="space-y-5">
          <div>
            <h2 className="text-bronze font-medium">Options</h2>
            <p className="text-muted text-xs">Let customers choose things like colour, size or phone model. Their choice is included in the WhatsApp order.</p>
          </div>
          {f.options.map((o, i) => (
            <div key={i} className="border-line space-y-3 rounded-2xl border p-4">
              <div className="flex items-center gap-2">
                <input
                  className="field"
                  placeholder="Option name, e.g. Colour"
                  value={o.name}
                  onChange={(e) => set("options", f.options.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))}
                />
                <button type="button" onClick={() => set("options", f.options.filter((_, k) => k !== i))} className="text-muted hover:text-red-700 p-2" aria-label="Remove option">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <ValuesEditor
                values={o.values}
                onChange={(values) => set("options", f.options.map((x, k) => (k === i ? { ...x, values } : x)))}
              />
            </div>
          ))}
          {f.options.length < 5 && (
            <button type="button" onClick={() => set("options", [...f.options, { name: "", values: [] }])} className="btn-outline !py-2.5">
              <Plus className="size-4" /> Add option
            </button>
          )}
          <div className="border-line border-t pt-5">
            <Toggle
              checked={f.personalizable}
              onChange={(v) => set("personalizable", v)}
              label="Allow personalisation"
              hint="Shows a text box so customers can add a name, initials or message."
            />
            {f.personalizable && (
              <label className="mt-3 block">
                <span className="field-label">Personalisation box label</span>
                <input className="field" placeholder="e.g. Name to add" value={f.personalizationLabel} onChange={(e) => set("personalizationLabel", e.target.value)} maxLength={60} />
              </label>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <Card className="space-y-5">
          <label className="block">
            <span className="field-label">Category *</span>
            <select className="field" value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Price (LKR) *</span>
            <input className="field" inputMode="numeric" value={f.price} onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))} required placeholder="4500" />
          </label>
          <label className="block">
            <span className="field-label">Original price (optional)</span>
            <input className="field" inputMode="numeric" value={f.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value.replace(/\D/g, ""))} placeholder="Shows a Sale badge" />
          </label>
        </Card>
        <Card className="space-y-4">
          <Toggle checked={f.visible} onChange={(v) => set("visible", v)} label="Visible on website" />
          <Toggle checked={f.featured} onChange={(v) => set("featured", v)} label="Featured" hint="Shown in “Most Loved” on the homepage" />
          <Toggle checked={f.isNew} onChange={(v) => set("isNew", v)} label="New in" hint="Shows a “New in” badge" />
          <Toggle checked={f.inStock} onChange={(v) => set("inStock", v)} label="Ready to ship" hint="Turn off to show “Made to order”" />
        </Card>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : saved ? <><Check className="size-4" /> Saved</> : product ? "Save changes" : "Create product"}
          </button>
          {product && (
            <Link href={`/product/${product.slug}`} target="_blank" className="btn-outline !px-4">View</Link>
          )}
        </div>
      </div>
    </form>
  );
}

function ValuesEditor({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter((s) => s && !values.includes(s));
    if (parts.length) onChange([...values, ...parts]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="bg-blush text-bronze flex items-center gap-1 rounded-full py-1 pr-1.5 pl-3 text-sm">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:text-red-700 p-0.5" aria-label={`Remove ${v}`}>
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          className="field !py-2 !text-sm"
          placeholder="Add a choice, e.g. Rose gold (press Enter)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
        />
      </div>
    </div>
  );
}
