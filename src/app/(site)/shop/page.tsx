import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories, getProducts } from "@/lib/data";
import { ShopBrowser } from "@/components/site/shop-browser";
import { SparkleRule } from "@/components/site/ornaments";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop handmade rhinestone phone cases, tumblers, apparel, gifts and canvas boards.",
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-8 lg:pt-14">
      <header className="text-center">
        <p className="eyebrow mb-3">The collection</p>
        <h1 className="font-display text-bronze text-5xl sm:text-6xl">
          <span className="font-script text-rose-gold mr-3 text-6xl sm:text-7xl">Shop</span>All Sparkle
        </h1>
        <SparkleRule className="mt-5" />
      </header>
      <Suspense fallback={<GridSkeleton />}>
        <ShopBrowser
          products={products.map((p) => ({ ...p, categoryName: catName.get(p.categoryId) }))}
          categories={categories.map(({ id, slug, name }) => ({ id, slug, name }))}
        />
      </Suspense>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-24 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="bg-blush/60 aspect-[4/5] animate-pulse rounded-[1.6rem] rounded-t-[10rem]" />
      ))}
    </div>
  );
}
