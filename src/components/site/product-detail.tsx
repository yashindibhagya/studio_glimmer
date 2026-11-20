"use client";

import { useState } from "react";
import { Check, Heart, Minus, Play, Plus, ShoppingBag, Sparkles, Truck, Hand } from "lucide-react";
import { videoPoster } from "@/lib/video";
import type { Product } from "@/lib/types";
import { formatLKR } from "@/lib/format";
import { OrderButtons } from "./order-buttons";
import { useBag } from "./bag-context";
import { ProductVisual } from "./product-visual";
import { SparkleRule } from "./ornaments";

export function ProductDetail({
  product,
  categoryName,
  whatsappNumber,
}: {
  product: Product;
  categoryName?: string;
  whatsappNumber: string;
}) {
  const { add, wishlist, toggleWish, ready } = useBag();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [personalization, setPersonalization] = useState("");
  const [choices, setChoices] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.filter((o) => o.values.length).map((o) => [o.name, o.values[0]])),
  );
  const [added, setAdded] = useState(false);

  const videos = product.videos ?? [];
  // Photos first, then videos. The placeholder only shows when there's nothing at all.
  const photos: (string | null)[] = product.images.length ? product.images : videos.length ? [] : [null];
  const media = [
    ...photos.map((src) => ({ kind: "image" as const, src })),
    ...videos.map((src) => ({ kind: "video" as const, src })),
  ];
  const current = media[active] ?? media[0];
  const wished = ready && wishlist.includes(product.id);
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  const line = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.images[0],
    options: choices,
    personalization: personalization.trim() || undefined,
  };

  const addToBag = () => {
    add(line, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Gallery */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="ring-rose-gold rounded-t-full rounded-b-[2.2rem] p-2.5">
          <div className="bg-blush relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[1.8rem]">
            {current.kind === "video" && current.src ? (
              <video
                key={current.src}
                src={current.src}
                poster={videoPoster(current.src)}
                controls
                playsInline
                autoPlay
                muted
                loop
                preload="metadata"
                aria-label={`${product.name} video`}
                className="absolute inset-0 size-full bg-black object-cover"
              />
            ) : (
              <ProductVisual src={current.src} alt={product.name} priority sizes="(min-width:1024px) 45vw, 95vw" />
            )}
          </div>
        </div>
        {media.length > 1 && (
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {media.map(({ kind, src }, i) => (
              <button
                key={src ?? i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={kind === "video" ? `Play video ${i + 1 - product.images.length}` : `View photo ${i + 1}`}
                aria-current={i === active}
                className={`bg-blush relative size-18 overflow-hidden rounded-2xl transition ${
                  i === active ? "ring-rose ring-2 ring-offset-2 ring-offset-cream" : "opacity-70 hover:opacity-100"
                }`}
              >
                {kind === "video" && src ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={videoPoster(src, 160)} alt="" className="size-full bg-black object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <Play className="size-5 fill-white text-white" />
                    </span>
                  </>
                ) : (
                  <ProductVisual src={src} alt="" sizes="72px" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="lg:pt-6">
        {categoryName && <p className="eyebrow">{categoryName}</p>}
        <h1 className="font-display text-bronze mt-3 text-4xl leading-tight sm:text-5xl">{product.name}</h1>
        <p className="mt-4 text-xl">
          <span className="text-rose-deep">{formatLKR(product.price)}</span>
          {onSale && <span className="text-muted ml-3 text-base line-through">{formatLKR(product.compareAtPrice!)}</span>}
        </p>
        {!product.inStock && (
          <p className="bg-blush text-bronze mt-3 inline-block rounded-full px-3 py-1 text-xs">Made to order — allow extra time</p>
        )}
        <SparkleRule className="mt-6 !justify-start" />
        <p className="text-muted mt-6 leading-relaxed whitespace-pre-line">{product.description}</p>

        <div className="mt-8 space-y-6">
          {product.options.filter((o) => o.values.length).map((o) => (
            <fieldset key={o.name}>
              <legend className="field-label">
                {o.name}: <span className="text-bronze normal-case tracking-normal">{choices[o.name]}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {o.values.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setChoices((c) => ({ ...c, [o.name]: v }))}
                    aria-pressed={choices[o.name] === v}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      choices[o.name] === v ? "border-bronze bg-bronze text-cream" : "border-line text-bronze hover:border-rose"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}

          {product.personalizable && (
            <label className="block">
              <span className="field-label">{product.personalizationLabel || "Personalisation"}</span>
              <input
                className="field"
                value={personalization}
                onChange={(e) => setPersonalization(e.target.value.slice(0, 80))}
                placeholder="e.g. Amaya"
                maxLength={80}
              />
            </label>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className="border-line bg-ivory flex items-center rounded-full border">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3.5" aria-label="Decrease quantity">
                <Minus className="size-3.5" />
              </button>
              <span className="w-8 text-center" aria-live="polite">{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} className="p-3.5" aria-label="Increase quantity">
                <Plus className="size-3.5" />
              </button>
            </div>
            <button type="button" onClick={addToBag} className="btn-primary flex-1">
              {added ? <><Check className="size-4" /> Added</> : <><ShoppingBag className="size-4" /> Add to bag</>}
            </button>
            <button
              type="button"
              onClick={() => toggleWish(product.id)}
              aria-pressed={wished}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              className="border-line text-bronze flex size-12 items-center justify-center rounded-full border transition hover:border-rose"
            >
              <Heart className={`size-4 ${wished ? "fill-rose text-rose" : ""}`} strokeWidth={1.5} />
            </button>
          </div>
          <OrderButtons
            lines={[{ ...line, key: "now", qty }]}
            whatsappNumber={whatsappNumber}
            primaryClass="btn-outline"
          />
        </div>

        <ul className="border-line mt-10 grid gap-4 border-t pt-8 sm:grid-cols-3">
          {[
            { Icon: Hand, text: "Hand-placed, stone by stone" },
            { Icon: Sparkles, text: "Personalisation available" },
            { Icon: Truck, text: "Island-wide delivery" },
          ].map(({ Icon, text }) => (
            <li key={text} className="text-muted flex items-center gap-3 text-xs sm:flex-col sm:text-center">
              <Icon className="text-rose size-5 shrink-0" strokeWidth={1.3} />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
