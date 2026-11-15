"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { Faq } from "@/lib/types";
import { deleteFaq, moveItem, saveFaq } from "@/app/admin/actions";
import { Card } from "./ui";
import { useAdminAction } from "./use-action";

export function FaqManager({ faqs }: { faqs: Faq[] }) {
  const { pending, run } = useAdminAction();
  const [adding, setAdding] = useState(false);
  return (
    <div className={`space-y-4 ${pending ? "opacity-70" : ""}`}>
      {adding ? (
        <FaqEditor onDone={() => setAdding(false)} />
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="btn-primary !py-3"><Plus className="size-4" /> Add question</button>
      )}
      {faqs.map((f, i) => (
        <div key={f.id} className="flex gap-2">
          <div className="flex flex-col pt-6">
            <button type="button" disabled={i === 0} onClick={() => run(() => moveItem("faqs", f.id, -1))} className="text-muted p-0.5 disabled:opacity-20" aria-label="Move up"><ArrowUp className="size-4" /></button>
            <button type="button" disabled={i === faqs.length - 1} onClick={() => run(() => moveItem("faqs", f.id, 1))} className="text-muted p-0.5 disabled:opacity-20" aria-label="Move down"><ArrowDown className="size-4" /></button>
          </div>
          <div className="flex-1"><FaqEditor faq={f} /></div>
        </div>
      ))}
    </div>
  );
}

function FaqEditor({ faq, onDone }: { faq?: Faq; onDone?: () => void }) {
  const { pending, run } = useAdminAction();
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const dirty = !faq || question !== faq.question || answer !== faq.answer;
  return (
    <Card className="space-y-3">
      <label className="block"><span className="field-label">Question</span>
        <input className="field" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={200} />
      </label>
      <label className="block"><span className="field-label">Answer</span>
        <textarea className="field min-h-24" value={answer} onChange={(e) => setAnswer(e.target.value)} maxLength={2000} />
      </label>
      <div className="flex justify-end gap-2">
        {onDone && <button type="button" onClick={onDone} className="btn-outline !py-2.5">Cancel</button>}
        {faq && (
          <button type="button" onClick={() => confirm("Delete this question?") && run(() => deleteFaq(faq.id))} className="text-muted hover:text-red-700 p-2" aria-label="Delete question"><Trash2 className="size-4" /></button>
        )}
        <button type="button" disabled={pending || !dirty} onClick={() => run(() => saveFaq({ id: faq?.id, question, answer }), onDone)} className="btn-primary !py-2.5">
          {faq ? "Save" : "Add question"}
        </button>
      </div>
    </Card>
  );
}
