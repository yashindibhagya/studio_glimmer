"use client";

import { useState } from "react";
import { buildOrder, whatsappLink, type BagLine } from "@/lib/format";
import { WhatsAppIcon } from "./whatsapp-icon";

/** Opens WhatsApp with the order (items, quantities, total and invoice link) already typed in. */
export function OrderButtons({
  lines,
  whatsappNumber,
  primaryClass = "btn-primary",
}: {
  lines: BagLine[];
  whatsappNumber: string;
  primaryClass?: string;
}) {
  const [invoiceUrl, setInvoiceUrl] = useState("");

  const order = () => {
    const { text, invoiceUrl } = buildOrder(lines, window.location.origin);
    window.open(whatsappLink(whatsappNumber, text), "_blank", "noopener,noreferrer");
    setInvoiceUrl(invoiceUrl);
  };

  if (!whatsappNumber) {
    // Shown until the shop's WhatsApp number is added in Admin → Settings.
    return (
      <p className="border-line bg-blush/50 text-muted rounded-2xl border px-4 py-3 text-center text-xs leading-relaxed">
        WhatsApp ordering will be available here shortly.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={order} className={`${primaryClass} w-full`}>
        <WhatsAppIcon className="size-4" /> Order on WhatsApp
      </button>
      {invoiceUrl && (
        <div role="status" className="border-line bg-blush/50 text-bronze rounded-2xl border px-4 py-3 text-xs leading-relaxed">
          <p>WhatsApp has opened with your order typed in. Press send to place it.</p>
          <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block underline underline-offset-4">
            View invoice
          </a>
        </div>
      )}
    </div>
  );
}
