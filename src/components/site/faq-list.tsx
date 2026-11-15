import { Plus } from "lucide-react";
import type { Faq } from "@/lib/types";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-line border-line mt-12 divide-y border-y">
      {faqs.map((f) => (
        <details key={f.id} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
            <span className="font-display text-bronze text-xl sm:text-2xl">{f.question}</span>
            <span className="border-rose/40 text-rose flex size-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-open:rotate-45">
              <Plus className="size-4" strokeWidth={1.5} />
            </span>
          </summary>
          <p className="text-muted pr-12 pb-6 leading-relaxed whitespace-pre-line">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
