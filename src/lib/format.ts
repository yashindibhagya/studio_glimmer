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

export function buildOrderMessage(lines: BagLine[], siteUrl: string) {
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const items = lines
    .map((l, i) => {
      const opts = Object.entries(l.options)
        .map(([k, v]) => `   ${k}: ${v}`)
        .join("\n");
      return [
        `${i + 1}. ${l.name} × ${l.qty} — ${formatLKR(l.price * l.qty)}`,
        opts,
        l.personalization ? `   Personalisation: ${l.personalization}` : "",
        `   ${siteUrl}/product/${l.slug}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
  return `Hi Studio Glimmer! ✨ I'd like to order:\n\n${items}\n\nEstimated total: ${formatLKR(total)}\n\nName:\nDelivery address:`;
}
