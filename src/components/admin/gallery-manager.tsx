"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import type { GalleryItem } from "@/lib/types";
import { addGalleryItems, deleteGalleryItem, moveItem, updateGalleryCaption } from "@/app/admin/actions";
import { uploadOne } from "./image-uploader";
import { Card } from "./ui";
import { useAdminAction } from "./use-action";

export function GalleryManager({ items }: { items: GalleryItem[] }) {
  const { pending, run } = useAdminAction();
  const [uploading, setUploading] = useState(0);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 20);
    setUploading(list.length);
    const urls: string[] = [];
    for (const f of list) {
      try {
        urls.push(await uploadOne(f, "gallery"));
      } catch (e) {
        alert(e instanceof Error ? e.message : "Upload failed");
      }
      setUploading((n) => n - 1);
    }
    if (urls.length) await run(() => addGalleryItems(urls));
  };

  return (
    <div className={pending ? "opacity-70" : ""}>
      <label className="btn-primary mb-6 cursor-pointer !py-3">
        {uploading ? <><Loader2 className="size-4 animate-spin" /> Uploading {uploading}…</> : <><ImagePlus className="size-4" /> Upload photos</>}
        <input type="file" accept="image/*,.heic,.heif" multiple className="sr-only" disabled={uploading > 0} onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
      </label>
      {items.length === 0 ? (
        <Card><p className="text-muted py-8 text-center text-sm">No photos yet — upload photos of your best finished pieces.</p></Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((g, i) => (
            <div key={g.id} className="bg-ivory border-line overflow-hidden rounded-3xl border">
              <div className="bg-blush aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.image} alt={g.caption} className="size-full object-cover" />
              </div>
              <div className="space-y-2 p-3">
                <input
                  className="field !py-2 !text-sm"
                  defaultValue={g.caption}
                  placeholder="Caption (optional)"
                  maxLength={140}
                  onBlur={(e) => e.target.value !== g.caption && run(() => updateGalleryCaption(g.id, e.target.value))}
                />
                <div className="flex items-center justify-between">
                  <div className="flex">
                    <button type="button" disabled={i === 0} onClick={() => run(() => moveItem("gallery", g.id, -1))} className="text-muted p-1.5 disabled:opacity-20" aria-label="Move earlier"><ArrowLeft className="size-4" /></button>
                    <button type="button" disabled={i === items.length - 1} onClick={() => run(() => moveItem("gallery", g.id, 1))} className="text-muted p-1.5 disabled:opacity-20" aria-label="Move later"><ArrowRight className="size-4" /></button>
                  </div>
                  <button type="button" onClick={() => confirm("Delete this photo?") && run(() => deleteGalleryItem(g.id))} className="text-muted hover:text-red-700 p-1.5" aria-label="Delete photo"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
