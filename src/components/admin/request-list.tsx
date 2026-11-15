"use client";

import { useState } from "react";
import { Calendar, Mail, Phone, Trash2, Wallet } from "lucide-react";
import type { CustomRequest, RequestStatus } from "@/lib/types";
import { deleteRequest, updateRequest } from "@/app/admin/actions";
import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { Card, STATUS_OPTIONS, StatusPill } from "./ui";
import { useAdminAction } from "./use-action";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/** Converts a local Sri Lankan number (07X…) to international format for WhatsApp. */
function toWhatsApp(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("0") && d.length === 10) return `94${d.slice(1)}`;
  return d;
}

export function RequestList({ requests, categories }: { requests: CustomRequest[]; categories: Record<string, string> }) {
  const [filter, setFilter] = useState<RequestStatus | "open" | "all">("open");
  const shown = requests.filter((r) =>
    filter === "all" ? true : filter === "open" ? r.status !== "archived" && r.status !== "completed" : r.status === filter,
  );

  return (
    <>
      <div className="-mx-4 mb-5 overflow-x-auto px-4">
        <div className="flex w-max gap-2">
          {[{ value: "open", label: "Open" }, ...STATUS_OPTIONS, { value: "all", label: "All" }].map((o) => {
            const n = o.value === "all" ? requests.length : o.value === "open" ? requests.filter((r) => r.status !== "archived" && r.status !== "completed").length : requests.filter((r) => r.status === o.value).length;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => setFilter(o.value as typeof filter)}
                className={`rounded-full border px-4 py-2 text-xs whitespace-nowrap transition ${filter === o.value ? "bg-bronze border-bronze text-cream" : "border-line text-bronze bg-ivory"}`}
              >
                {o.label} <span className="opacity-60">({n})</span>
              </button>
            );
          })}
        </div>
      </div>
      {shown.length === 0 ? (
        <Card><p className="text-muted py-8 text-center text-sm">No requests here.</p></Card>
      ) : (
        <div className="space-y-4">
          {shown.map((r) => <RequestCard key={r.id} r={r} categoryName={r.categoryId ? categories[r.categoryId] : undefined} />)}
        </div>
      )}
    </>
  );
}

function RequestCard({ r, categoryName }: { r: CustomRequest; categoryName?: string }) {
  const { pending, run } = useAdminAction();
  const [notes, setNotes] = useState(r.adminNotes ?? "");
  const wa = whatsappLink(toWhatsApp(r.phone), `Hi ${r.name.split(" ")[0]}! ✨ This is Studio Glimmer — thank you for your custom order request.`);

  return (
    <Card className={`scroll-mt-24 ${pending ? "opacity-70" : ""}`}>
      <div id={r.id} className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-bronze text-lg font-medium">{r.name}</h2>
            <StatusPill status={r.status} />
          </div>
          <p className="text-muted text-xs">{dateFmt.format(new Date(r.createdAt))}{categoryName && ` · ${categoryName}`}</p>
        </div>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm text-white">
          <WhatsAppIcon className="size-4" /> Reply on WhatsApp
        </a>
      </div>

      <p className="text-ink mt-4 leading-relaxed whitespace-pre-line">{r.description}</p>

      <div className="text-muted mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5"><Phone className="size-3.5" /> <a href={`tel:${r.phone}`} className="hover:underline">{r.phone}</a></span>
        {r.email && <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> <a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a></span>}
        {r.budget && <span className="flex items-center gap-1.5"><Wallet className="size-3.5" /> {r.budget}</span>}
        {r.neededBy && <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> Needed by {r.neededBy}</span>}
      </div>

      {r.images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {r.images.map((src, i) => (
            <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="bg-blush block size-24 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Reference ${i + 1}`} className="size-full object-cover transition hover:scale-105" />
            </a>
          ))}
        </div>
      )}

      <div className="border-line mt-5 grid gap-3 border-t pt-5 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
        <label className="block">
          <span className="field-label">Status</span>
          <select className="field" value={r.status} onChange={(e) => run(() => updateRequest(r.id, { status: e.target.value as RequestStatus }))}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Private notes</span>
          <input
            className="field"
            value={notes}
            placeholder="e.g. Quoted LKR 6,500 — waiting for advance"
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== (r.adminNotes ?? "") && run(() => updateRequest(r.id, { adminNotes: notes }))}
          />
        </label>
        <button
          type="button"
          onClick={() => confirm("Delete this request and its photos?") && run(() => deleteRequest(r.id))}
          className="text-muted hover:text-red-700 justify-self-end p-3"
          aria-label="Delete request"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </Card>
  );
}
