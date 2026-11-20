"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Film, Play, Trash2 } from "lucide-react";
import { videoUploadTicket } from "@/app/admin/actions";
import { MAX_VIDEO_BYTES, MAX_VIDEOS, videoPoster } from "@/lib/video";

/** Sends one video straight from the browser to Cloudinary, reporting progress (0–1). */
async function uploadVideo(file: File, onProgress: (p: number) => void): Promise<string> {
  if (!file.type.startsWith("video/")) throw new Error(`“${file.name}” is not a video.`);
  if (file.size > MAX_VIDEO_BYTES) throw new Error(`“${file.name}” is too large (max 100 MB). Try a shorter clip.`);

  const res = await videoUploadTicket();
  if (!res.ok || !res.ticket) throw new Error(res.error ?? "Could not start the upload");
  const t = res.ticket;

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", t.apiKey);
  fd.append("folder", t.folder);
  fd.append("timestamp", String(t.timestamp));
  fd.append("signature", t.signature);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", t.uploadUrl);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onerror = () => reject(new Error("Upload failed — check your internet connection."));
    xhr.onload = () => {
      let json: { secure_url?: string; error?: { message: string } } = {};
      try {
        json = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && json.secure_url) resolve(json.secure_url);
      else reject(new Error(`Video upload failed: ${json.error?.message ?? xhr.status}`));
    };
    xhr.send(fd);
  });
}

export function VideoUploader({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const list = Array.from(files).slice(0, MAX_VIDEOS - value.length);
    const uploaded: string[] = [];
    for (const f of list) {
      setProgress(0);
      try {
        uploaded.push(await uploadVideo(f, setProgress));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    }
    setProgress(null);
    onChange([...value, ...uploaded]);
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <div>
      <span className="field-label">Videos</span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((url, i) => (
          <div key={url} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-black">
            <video src={url} poster={videoPoster(url, 400)} controls playsInline preload="metadata" className="size-full object-cover" />
            <div className="bg-black/55 absolute inset-x-0 top-0 flex justify-between p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <div className="flex gap-1">
                {i > 0 && (
                  <IconBtn label="Move left" onClick={() => move(i, -1)}><ChevronLeft className="size-3.5" /></IconBtn>
                )}
                {i < value.length - 1 && (
                  <IconBtn label="Move right" onClick={() => move(i, 1)}><ChevronRight className="size-3.5" /></IconBtn>
                )}
              </div>
              <IconBtn label="Remove video" onClick={() => onChange(value.filter((u) => u !== url))}>
                <Trash2 className="size-3.5" />
              </IconBtn>
            </div>
          </div>
        ))}
        {progress !== null && (
          <div className="bg-blush/60 text-rose flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-2xl px-4 text-xs">
            <Play className="size-5 animate-pulse" />
            Uploading… {Math.round(progress * 100)}%
            <div className="bg-rose/20 h-1.5 w-full overflow-hidden rounded-full">
              <div className="bg-rose h-full transition-[width]" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        )}
        {progress === null && value.length < MAX_VIDEOS && (
          <label className="border-rose/50 text-rose hover:bg-blush/40 flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed text-xs transition">
            <Film className="size-6" strokeWidth={1.3} />
            Add video
            <input
              type="file"
              accept="video/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      <p className="text-muted mt-2 text-xs">
        Up to {MAX_VIDEOS} short clips (max 100 MB each). They show after the photos on the product page. Save the product after uploading.
      </p>
      {error && <p className="mt-2 text-sm text-red-700 dark:text-red-400">{error}</p>}
    </div>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="rounded-full bg-white/90 p-1.5 text-black hover:bg-white">
      {children}
    </button>
  );
}
