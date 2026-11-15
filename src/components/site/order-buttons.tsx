"use client";

import { useState } from "react";
import { buildOrder, instagramDmLink, whatsappLink, type BagLine } from "@/lib/format";
import { InstagramIcon, WhatsAppIcon } from "./whatsapp-icon";

/**
 * Sends the order to the shop's chat.
 * WhatsApp opens with the order already typed in. Instagram cannot be pre-filled,
 * so the order is copied and the customer pastes it into the chat.
 */
export function OrderButtons({
  lines,
  whatsappNumber,
  instagramUrl,
  primaryClass = "btn-primary",
  secondaryClass = "btn-outline",
}: {
  lines: BagLine[];
  whatsappNumber: string;
  instagramUrl: string;
  primaryClass?: string;
  secondaryClass?: string;
}) {
  const [sent, setSent] = useState<{ via: "whatsapp" | "instagram"; copied: boolean; text: string; invoiceUrl: string } | null>(null);

  const viaWhatsApp = () => {
    const order = buildOrder(lines, window.location.origin);
    window.open(whatsappLink(whatsappNumber, order.text), "_blank", "noopener,noreferrer");
    setSent({ via: "whatsapp", copied: false, ...order });
  };

  const viaInstagram = () => {
    const order = buildOrder(lines, window.location.origin);
    // Start the copy before opening Instagram, while this page still has focus.
    const copy = navigator.clipboard?.writeText(order.text) ?? Promise.reject(new Error("no clipboard"));
    window.open(instagramDmLink(instagramUrl), "_blank", "noopener,noreferrer");
    copy.then(
      () => setSent({ via: "instagram", copied: true, ...order }),
      () => setSent({ via: "instagram", copied: false, ...order }),
    );
  };

  const copyAgain = async () => {
    if (!sent) return;
    try {
      await navigator.clipboard.writeText(sent.text);
      setSent({ ...sent, copied: true });
    } catch {
      setSent({ ...sent, copied: false });
    }
  };

  return (
    <div className="space-y-3">
      {whatsappNumber && (
        <button type="button" onClick={viaWhatsApp} className={`${primaryClass} w-full`}>
          <WhatsAppIcon className="size-4" /> Order on WhatsApp
        </button>
      )}
      {instagramUrl && (
        <button type="button" onClick={viaInstagram} className={`${whatsappNumber ? secondaryClass : primaryClass} w-full`}>
          <InstagramIcon className="size-4" /> Order via Instagram
        </button>
      )}
      {sent && (
        <div role="status" className="border-line bg-blush/50 text-bronze rounded-2xl border px-4 py-3 text-xs leading-relaxed">
          {sent.via === "whatsapp" ? (
            <p>WhatsApp has opened with your order typed in. Press send to place it.</p>
          ) : sent.copied ? (
            <p>Your order is copied. In the Instagram chat that opened, press and hold the message box, choose Paste, then send.</p>
          ) : (
            <p>Instagram has opened. Copy your order with the button below and paste it into the chat.</p>
          )}
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {sent.via === "instagram" && (
              <button type="button" onClick={copyAgain} className="underline underline-offset-4">
                Copy order again
              </button>
            )}
            <a href={sent.invoiceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              View invoice
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
