import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getProducts, getSettings } from "@/lib/data";
import { decodeOrder, formatLKR } from "@/lib/format";
import { ProductVisual } from "@/components/site/product-visual";
import { SparkleRule } from "@/components/site/ornaments";
import { PrintButton } from "@/components/site/print-button";

export const metadata: Metadata = { title: "Order invoice", robots: { index: false } };

export default function InvoicePage({ searchParams }: PageProps<"/invoice">) {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <Invoice searchParams={searchParams} />
    </Suspense>
  );
}

async function Invoice({ searchParams }: Pick<PageProps<"/invoice">, "searchParams">) {
  const { o } = await searchParams;
  const order = decodeOrder(typeof o === "string" ? o : "");
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = (order?.lines ?? []).flatMap((l) => {
    const product = byId.get(l.id);
    return product ? [{ ...l, product }] : [];
  });

  if (!order || lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center">
        <h1 className="font-display text-bronze text-4xl">Invoice not found</h1>
        <p className="text-muted mt-4">This invoice link is incomplete, or the products in it are no longer available.</p>
        <Link href="/shop" className="btn-outline mt-8">Browse the shop</Link>
      </div>
    );
  }

  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const pieces = lines.reduce((s, l) => s + l.qty, 0);
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Colombo" }).format(order.at);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-8 lg:pt-14">
      <article className="bg-ivory border-line rounded-[2rem] border p-6 shadow-[0_30px_60px_-45px_rgb(29_27_25/0.6)] sm:p-10 print:border-0 print:shadow-none">
        <header className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <Image src="/logo.webp" alt="Studio Glimmer" width={84} height={84} className="logo-blend -m-2" />
            <div>
              <p className="font-display text-bronze text-2xl leading-tight">Studio Glimmer</p>
              <p className="text-muted text-xs">Custom rhinestone creations</p>
              {settings.location && <p className="text-muted text-xs">{settings.location}</p>}
            </div>
          </div>
          <div className="sm:text-right">
            <p className="eyebrow">Order invoice</p>
            <p className="font-display text-bronze mt-1 text-3xl leading-none">{order.ref}</p>
            <p className="text-muted mt-2 text-xs">{date}</p>
          </div>
        </header>

        <SparkleRule className="mt-8" />

        <ul className="divide-line mt-6 divide-y">
          {lines.map((l, i) => (
            <li key={i} className="flex gap-4 py-5 sm:gap-6">
              <div className="bg-blush relative size-24 shrink-0 overflow-hidden rounded-2xl sm:size-28">
                <ProductVisual src={l.product.images[0]} alt={l.product.name} sizes="112px" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/product/${l.product.slug}`} className="font-display text-bronze text-xl leading-tight">
                  {l.product.name}
                </Link>
                <div className="text-muted mt-1 space-y-0.5 text-xs">
                  {Object.entries(l.options).map(([k, v]) => (
                    <p key={k}>{k}: {v}</p>
                  ))}
                  {l.note && <p>Personalisation: “{l.note}”</p>}
                </div>
                <div className="mt-auto flex items-end justify-between gap-4 pt-3 text-sm">
                  <p className="text-muted">
                    Qty <span className="text-bronze font-medium">{l.qty}</span> × {formatLKR(l.product.price)}
                  </p>
                  <p className="text-bronze font-medium">{formatLKR(l.product.price * l.qty)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-line mt-2 border-t pt-6">
          <div className="text-muted flex justify-between text-sm">
            <span>Items</span>
            <span>{pieces} {pieces === 1 ? "piece" : "pieces"}</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="eyebrow">Estimated total</span>
            <span className="font-display text-bronze text-3xl">{formatLKR(total)}</span>
          </div>
          <p className="text-muted mt-3 text-xs leading-relaxed">
            Delivery charges are not included. The final price and delivery date are confirmed with you in the chat before we begin.
          </p>
        </div>
      </article>

      <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
        <PrintButton />
        <Link href="/shop" className="btn-outline">Continue shopping</Link>
      </div>
    </div>
  );
}
