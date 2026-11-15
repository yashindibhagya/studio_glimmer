import { Star } from "lucide-react";
import type { Review } from "@/lib/types";

export function ReviewCards({ reviews }: { reviews: Review[] }) {
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-3">
      {reviews.map((r) => (
        <figure key={r.id} className="bg-ivory border-line relative flex flex-col rounded-[2rem] border p-8 text-center">
          <span className="font-script text-rose-light absolute top-2 left-6 text-7xl leading-none" aria-hidden>“</span>
          <div className="flex justify-center gap-1" aria-label={`${r.rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className={`size-4 ${i < r.rating ? "fill-rose text-rose" : "text-line"}`} strokeWidth={1.2} />
            ))}
          </div>
          <blockquote className="font-display text-bronze mt-5 flex-1 text-xl leading-snug italic">{r.text}</blockquote>
          <figcaption className="mt-6">
            <p className="eyebrow text-bronze">{r.name}</p>
            {r.product && <p className="text-muted mt-1 text-xs">on {r.product}</p>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
