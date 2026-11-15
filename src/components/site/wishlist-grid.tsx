"use client";

import Link from "next/link";
import { useBag } from "./bag-context";
import { ProductCard, type CardProduct } from "./product-card";
import { Sparkle } from "./ornaments";

export function WishlistGrid({ products }: { products: CardProduct[] }) {
  const { wishlist, ready } = useBag();
  if (!ready) return null;
  const items = products.filter((p) => wishlist.includes(p.id));
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <Sparkle className="text-rose-light size-8" />
        <p className="font-display text-bronze text-2xl">Nothing saved yet</p>
        <p className="text-muted text-sm">Tap the heart on any piece to save it here.</p>
        <Link href="/shop" className="btn-outline mt-2">Browse the shop</Link>
      </div>
    );
  }
  return (
    <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
