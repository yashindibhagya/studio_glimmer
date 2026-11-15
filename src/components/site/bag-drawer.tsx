"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { buildOrderMessage, formatLKR, whatsappLink } from "@/lib/format";
import { useBag } from "./bag-context";
import { ProductVisual } from "./product-visual";
import { Sparkle } from "./ornaments";
import { WhatsAppIcon } from "./whatsapp-icon";
import { OnNavigate } from "./pathname";

export function BagDrawer({ whatsappNumber, instagramUrl }: { whatsappNumber: string; instagramUrl: string }) {
  const { lines, open, setOpen, setQty, removeLine } = useBag();
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const checkout = () => {
    const site = window.location.origin;
    const text = buildOrderMessage(lines, site);
    const url = whatsappNumber ? whatsappLink(whatsappNumber, text) : instagramUrl;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <OnNavigate onChange={() => setOpen(false)} />
      <div
        className={`bg-black/40 absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        role="dialog"
        aria-label="Order bag"
        inert={!open}
        className={`bg-cream absolute inset-y-0 right-0 flex w-full max-w-md flex-col transition-transform duration-300 ${
          open ? "translate-x-0 shadow-2xl" : "translate-x-full"
        }`}
      >
        <div className="border-line flex items-center justify-between border-b px-6 py-5">
          <div>
            <p className="eyebrow">Your</p>
            <h2 className="font-display text-bronze text-3xl leading-none">Order Bag</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="text-bronze p-2" aria-label="Close bag">
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <Sparkle className="text-rose-light size-8" />
            <p className="font-display text-bronze text-2xl">Your bag is empty</p>
            <p className="text-muted text-sm">Add a little sparkle — your order is sent to us on WhatsApp in one tap.</p>
            <Link href="/shop" className="btn-outline mt-2">Browse the shop</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-4 py-5">
                  <Link href={`/product/${l.slug}`} className="bg-blush relative size-22 shrink-0 overflow-hidden rounded-xl">
                    <ProductVisual src={l.image} alt={l.name} sizes="88px" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/product/${l.slug}`} className="font-display text-bronze text-lg leading-tight">
                        {l.name}
                      </Link>
                      <button type="button" onClick={() => removeLine(l.key)} className="text-muted p-1 hover:text-rose-deep" aria-label={`Remove ${l.name}`}>
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="text-muted mt-1 space-y-0.5 text-xs">
                      {Object.entries(l.options).map(([k, v]) => (
                        <p key={k}>{k}: {v}</p>
                      ))}
                      {l.personalization && <p>Personalisation: “{l.personalization}”</p>}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="border-line flex items-center rounded-full border">
                        <button type="button" onClick={() => setQty(l.key, l.qty - 1)} className="p-2" aria-label="Decrease quantity">
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{l.qty}</span>
                        <button type="button" onClick={() => setQty(l.key, l.qty + 1)} className="p-2" aria-label="Increase quantity">
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <p className="text-bronze text-sm">{formatLKR(l.price * l.qty)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-line bg-ivory border-t px-6 py-6">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow">Estimated total</span>
                <span className="font-display text-bronze text-2xl">{formatLKR(total)}</span>
              </div>
              <p className="text-muted mt-1 text-xs">Delivery & final price confirmed with you on WhatsApp.</p>
              <button type="button" onClick={checkout} className="btn-primary mt-5 w-full">
                <WhatsAppIcon className="size-4" />
                {whatsappNumber ? "Order on WhatsApp" : "Order via Instagram"}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
