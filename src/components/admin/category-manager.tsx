"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { Category } from "@/lib/types";
import { deleteCategory, moveItem, saveCategory } from "@/app/admin/actions";
import { ImageUploader } from "./image-uploader";
import { Card } from "./ui";
import { useAdminAction } from "./use-action";

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const { pending, run } = useAdminAction();
  const [adding, setAdding] = useState(false);

  return (
    <div className={`space-y-4 ${pending ? "opacity-70" : ""}`}>
      {adding ? (
        <CategoryEditor onDone={() => setAdding(false)} />
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="btn-primary !py-3">
          <Plus className="size-4" /> Add category
        </button>
      )}
      {categories.map((c, i) => (
        <Card key={c.id} className="flex gap-3">
          <div className="flex flex-col pt-1">
            <button type="button" disabled={i === 0} onClick={() => run(() => moveItem("categories", c.id, -1))} className="text-muted p-0.5 disabled:opacity-20" aria-label="Move up"><ArrowUp className="size-4" /></button>
            <button type="button" disabled={i === categories.length - 1} onClick={() => run(() => moveItem("categories", c.id, 1))} className="text-muted p-0.5 disabled:opacity-20" aria-label="Move down"><ArrowDown className="size-4" /></button>
          </div>
          <div className="flex-1">
            <CategoryEditor category={c} count={counts[c.id] ?? 0} onDelete={() => confirm(`Delete "${c.name}"?`) && run(() => deleteCategory(c.id))} />
          </div>
        </Card>
      ))}
    </div>
  );
}

function CategoryEditor({
  category,
  count,
  onDone,
  onDelete,
}: {
  category?: Category;
  count?: number;
  onDone?: () => void;
  onDelete?: () => void;
}) {
  const { pending, run } = useAdminAction();
  const [name, setName] = useState(category?.name ?? "");
  const [tagline, setTagline] = useState(category?.tagline ?? "");
  const [image, setImage] = useState<string[]>(category?.image ? [category.image] : []);
  const dirty = !category || name !== category.name || tagline !== category.tagline || (image[0] ?? null) !== (category.image ?? null);

  const save = () =>
    run(() => saveCategory({ id: category?.id, name, tagline, image: image[0] ?? null }), onDone);

  const body = (
    <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
      <ImageUploader value={image} onChange={setImage} max={1} folder="categories" label="Cover" hint="" />
      <div className="space-y-3">
        <label className="block">
          <span className="field-label">Name</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
        </label>
        <label className="block">
          <span className="field-label">Short tagline</span>
          <input className="field" value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={120} />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={save} disabled={pending || !dirty || !name.trim()} className="btn-primary !py-2.5">
            {category ? "Save" : "Create category"}
          </button>
          {onDone && <button type="button" onClick={onDone} className="btn-outline !py-2.5">Cancel</button>}
          {category && (
            <>
              <span className="text-muted ml-auto text-xs">{count} product(s) · /shop?category={category.slug}</span>
              <button type="button" onClick={onDelete} className="text-muted hover:text-red-700 p-2" aria-label="Delete category"><Trash2 className="size-4" /></button>
            </>
          )}
        </div>
        {!category?.image && image.length === 0 && (
          <p className="text-muted text-xs">No cover? The first product photo in this category is used automatically.</p>
        )}
      </div>
    </div>
  );
  return category ? body : <Card>{body}</Card>;
}
