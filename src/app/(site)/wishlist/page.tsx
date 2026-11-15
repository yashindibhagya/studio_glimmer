import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/data";
import { WishlistGrid } from "@/components/site/wishlist-grid";
import { SparkleRule } from "@/components/site/ornaments";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-8 lg:pt-14">
      <header className="text-center">
        <p className="eyebrow mb-3">Saved for later</p>
        <h1 className="font-display text-bronze text-5xl sm:text-6xl">
          <span className="font-script text-rose-gold mr-3 text-6xl sm:text-7xl">Your</span>Wishlist
        </h1>
        <SparkleRule className="mt-5" />
      </header>
      <WishlistGrid products={products.map((p) => ({ ...p, categoryName: catName.get(p.categoryId) }))} />
    </div>
  );
}
