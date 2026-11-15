import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { getCategories, getProductBySlug, getProducts, getSettings } from "@/lib/data";
import { ProductDetail } from "@/components/site/product-detail";
import { ProductCard } from "@/components/site/product-card";
import { SectionTitle } from "@/components/site/ornaments";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: product.images[0] ? { images: [product.images[0]] } : undefined,
  };
}

export default function ProductPage(props: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={props.params} />
    </Suspense>
  );
}

async function ProductContent({ params }: Pick<PageProps<"/product/[slug]">, "params">) {
  const { slug } = await params;
  const [product, categories, products, settings] = await Promise.all([
    getProductBySlug(slug),
    getCategories(),
    getProducts(),
    getSettings(),
  ]);
  if (!product) notFound();

  const category = categories.find((c) => c.id === product.categoryId);
  const related = products
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .concat(products.filter((p) => p.id !== product.id && p.categoryId !== product.categoryId && p.featured))
    .slice(0, 4)
    .map((p) => ({ ...p, categoryName: categories.find((c) => c.id === p.categoryId)?.name }));

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-24 sm:px-8">
      <nav aria-label="Breadcrumb" className="text-muted flex items-center gap-1.5 text-xs">
        <Link href="/" className="hover:text-rose">Home</Link>
        <ChevronRight className="size-3" />
        <Link href="/shop" className="hover:text-rose">Shop</Link>
        {category && (
          <>
            <ChevronRight className="size-3" />
            <Link href={`/shop?category=${category.slug}`} className="hover:text-rose">{category.name}</Link>
          </>
        )}
      </nav>

      <ProductDetail
        key={product.id}
        product={product}
        categoryName={category?.name}
        whatsappNumber={settings.whatsappNumber}
        instagramUrl={settings.instagramUrl}
      />

      {related.length > 0 && (
        <section className="mt-28">
          <SectionTitle eyebrow="You may also love" script="More" title="Sparkle" />
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-14 pb-24 sm:px-8 lg:grid-cols-2">
      <div className="bg-blush/60 aspect-[4/5] animate-pulse rounded-t-full rounded-b-[2rem]" />
      <div className="space-y-4 pt-8">
        <div className="bg-blush/60 h-4 w-24 animate-pulse rounded" />
        <div className="bg-blush/60 h-12 w-3/4 animate-pulse rounded" />
        <div className="bg-blush/60 h-6 w-32 animate-pulse rounded" />
      </div>
    </div>
  );
}
