export function formatLKR(amount: number) {
  return `LKR ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type BagLine = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  options: Record<string, string>;
  personalization?: string;
  qty: number;
};

export function whatsappLink(number: string, text: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Opens a direct-message chat with the shop's Instagram account (falls back to the profile link). */
export function instagramDmLink(instagramUrl: string) {
  const m = instagramUrl.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
  return m ? `https://ig.me/m/${m[1]}` : instagramUrl;
}

/** What the invoice link carries: only ids, quantities and choices. Names, photos and prices are looked up on the server. */
export type OrderPayload = {
  ref: string;
  at: number;
  lines: { id: string; qty: number; options: Record<string, string>; note?: string }[];
};

function toBase64Url(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodeOrder(order: OrderPayload) {
  return toBase64Url(
    JSON.stringify({ r: order.ref, t: order.at, l: order.lines.map((l) => [l.id, l.qty, l.options, l.note ?? ""]) }),
  );
}

export function decodeOrder(code: string): OrderPayload | null {
  try {
    if (!code || code.length > 6000) return null;
    const raw = JSON.parse(fromBase64Url(code)) as { r?: unknown; t?: unknown; l?: unknown };
    if (typeof raw.r !== "string" || typeof raw.t !== "number" || !Array.isArray(raw.l)) return null;
    const lines = raw.l.slice(0, 50).flatMap((row) => {
      if (!Array.isArray(row) || typeof row[0] !== "string") return [];
      const qty = Math.max(1, Math.min(99, Math.round(Number(row[1]) || 1)));
      const options: Record<string, string> = {};
      if (row[2] && typeof row[2] === "object") {
        for (const [k, v] of Object.entries(row[2] as Record<string, unknown>).slice(0, 10)) {
          if (typeof v === "string") options[k.slice(0, 40)] = v.slice(0, 60);
        }
      }
      const note = typeof row[3] === "string" && row[3] ? row[3].slice(0, 200) : undefined;
      return [{ id: row[0].slice(0, 80), qty, options, note }];
    });
    if (!lines.length) return null;
    return { ref: raw.r.replace(/[^A-Z0-9-]/gi, "").slice(0, 16), at: raw.t, lines };
  } catch {
    return null;
  }
}

/** Builds the chat message for an order, with a link to an invoice page that shows the photos. */
export function buildOrder(lines: BagLine[], siteUrl: string) {
  const at = Date.now();
  const ref = `SG-${at.toString(36).slice(-5).toUpperCase()}${Math.floor(Math.random() * 36).toString(36).toUpperCase()}`;
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const invoiceUrl = `${siteUrl}/invoice?o=${encodeOrder({
    ref,
    at,
    lines: lines.map((l) => ({ id: l.productId, qty: l.qty, options: l.options, note: l.personalization })),
  })}`;
  const items = lines
    .map((l, i) => {
      const opts = Object.entries(l.options)
        .map(([k, v]) => `   ${k}: ${v}`)
        .join("\n");
      return [
        `${i + 1}. ${l.name}`,
        `   Qty: ${l.qty} × ${formatLKR(l.price)} = ${formatLKR(l.price * l.qty)}`,
        opts,
        l.personalization ? `   Personalisation: ${l.personalization}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
  const text = `Hi Studio Glimmer! ✨ I'd like to order (${ref}):\n\n${items}\n\nEstimated total: ${formatLKR(total)}\n\nInvoice with photos:\n${invoiceUrl}\n\nName:\nDelivery address:`;
  return { ref, text, invoiceUrl };
}
