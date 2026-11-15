"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Star, Trash2 } from "lucide-react";
import type { Review } from "@/lib/types";
import { deleteReview, moveItem, saveReview } from "@/app/admin/actions";
import { Card, Toggle } from "./ui";
import { useAdminAction } from "./use-action";

export function ReviewManager({ reviews }: { reviews: Review[] }) {
  const { pending, run } = useAdminAction();
  const [adding, setAdding] = useState(false);
  return (
    <div className={`space-y-4 ${pending ? "opacity-70" : ""}`}>
      {adding ? (
        <ReviewEditor onDone={() => setAdding(false)} />
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="btn-primary !py-3"><Plus className="size-4" /> Add review</button>
      )}
      {reviews.map((r, i) => (
        <div key={r.id} className="flex gap-2">
          <div className="flex flex-col pt-6">
            <button type="button" disabled={i === 0} onClick={() => run(() => moveItem("reviews", r.id, -1))} className="text-muted p-0.5 disabled:opacity-20" aria-label="Move up"><ArrowUp className="size-4" /></button>
            <button type="button" disabled={i === reviews.length - 1} onClick={() => run(() => moveItem("reviews", r.id, 1))} className="text-muted p-0.5 disabled:opacity-20" aria-label="Move down"><ArrowDown className="size-4" /></button>
          </div>
          <div className="flex-1"><ReviewEditor review={r} /></div>
        </div>
      ))}
    </div>
  );
}

function ReviewEditor({ review, onDone }: { review?: Review; onDone?: () => void }) {
  const { pending, run } = useAdminAction();
  const [f, setF] = useState({
    name: review?.name ?? "",
    text: review?.text ?? "",
    rating: review?.rating ?? 5,
    product: review?.product ?? "",
    visible: review?.visible ?? true,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  return (
    <Card className={`space-y-4 ${review?.sample ? "!border-amber-300 dark:!border-amber-800" : ""}`}>
      {review?.sample && <p className="text-xs text-amber-800 dark:text-amber-300">Sample review — replace with a real one or delete it.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="field-label">Customer name</span>
          <input className="field" value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={60} />
        </label>
        <label className="block"><span className="field-label">Product (optional)</span>
          <input className="field" value={f.product} onChange={(e) => set("product", e.target.value)} maxLength={120} />
        </label>
      </div>
      <label className="block"><span className="field-label">Review</span>
        <textarea className="field min-h-24" value={f.text} onChange={(e) => set("text", e.target.value)} maxLength={600} />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={f.rating === n} onClick={() => set("rating", n)} aria-label={`${n} stars`}>
              <Star className={`size-5 ${n <= f.rating ? "fill-rose text-rose" : "text-line"}`} />
            </button>
          ))}
        </div>
        <Toggle checked={f.visible} onChange={(v) => set("visible", v)} label="Show on website" />
        <div className="ml-auto flex gap-2">
          {onDone && <button type="button" onClick={onDone} className="btn-outline !py-2.5">Cancel</button>}
          {review && (
            <button type="button" onClick={() => confirm("Delete this review?") && run(() => deleteReview(review.id))} className="text-muted hover:text-red-700 p-2" aria-label="Delete review"><Trash2 className="size-4" /></button>
          )}
          <button type="button" disabled={pending} onClick={() => run(() => saveReview({ id: review?.id, ...f }), onDone)} className="btn-primary !py-2.5">
            {review ? "Save" : "Add review"}
          </button>
        </div>
      </div>
    </Card>
  );
}
