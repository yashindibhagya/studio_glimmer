"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { uploadImageAction } from "@/app/admin/actions";
import { compressImage } from "@/lib/compress-image";

/** Uploads one compressed image and returns its URL. */
export async function uploadOne(file: File, folder: string) {
  const blob = await compressImage(file);
  const fd = new FormData();
  fd.append("folder", folder);
  fd.append("file", blob, "image");
  const res = await uploadImageAction(fd);
  if (!res.ok || !res.url) throw new Error(res.error ?? "Upload failed");
  return res.url;
}

export function ImageUploader({
  value,
  onChange,
  max = 8,
  folder,
  label = "Photos",
  hint = "The first photo is the main one. JPG, PNG or HEIC from your phone is fine — we resize it automatically.",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  folder: string;
  label?: string;
  hint?: string;
}) {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const list = Array.from(files).slice(0, max - value.length);
    setBusy(list.length);
    const uploaded: string[] = [];
    for (const f of list) {
      try {
        uploaded.push(await uploadOne(f, folder));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
      setBusy((n) => n - 1);
    }
    onChange([...value, ...uploaded]);
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {value.map((url, i) => (
          <div key={url} className="group bg-blush relative aspect-square overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="size-full object-cover" />
            {i === 0 && max > 1 && (
              <span className="bg-bronze text-cream absolute top-2 left-2 rounded-full px-2 py-0.5 text-[0.6rem] tracking-wider uppercase">Main</span>
            )}
            <div className="bg-ink/55 absolute inset-x-0 bottom-0 flex justify-between p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <div className="flex gap-1">
                {i > 0 && (
                  <IconBtn label="Move left" onClick={() => move(i, -1)}><ChevronLeft className="size-3.5" /></IconBtn>
                )}
                {i < value.length - 1 && (
                  <IconBtn label="Move right" onClick={() => move(i, 1)}><ChevronRight className="size-3.5" /></IconBtn>
                )}
              </div>
              <IconBtn label="Remove photo" onClick={() => onChange(value.filter((u) => u !== url))}>
                <Trash2 className="size-3.5" />
              </IconBtn>
            </div>
          </div>
        ))}
        {Array.from({ length: busy }, (_, i) => (
          <div key={`busy-${i}`} className="bg-blush/60 flex aspect-square items-center justify-center rounded-2xl">
            <Loader2 className="text-rose size-5 animate-spin" />
          </div>
        ))}
        {value.length + busy < max && (
          <label className="border-rose/50 text-rose hover:bg-blush/40 flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed text-xs transition">
            <ImagePlus className="size-6" strokeWidth={1.3} />
            {max === 1 ? "Upload" : "Add photos"}
            <input
              type="file"
              accept="image/*,.heic,.heif"
              multiple={max > 1}
              className="sr-only"
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      {hint && <p className="text-muted mt-2 text-xs">{hint}</p>}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="rounded-full bg-white/90 p-1.5 text-bronze hover:bg-white">
      {children}
    </button>
  );
}
