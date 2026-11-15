"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatLKR } from "@/lib/format";
import { useBag } from "./bag-context";
import { ProductVisual } from "./product-visual";

export type CardProduct = Pick<
  Product,
  "id" | "slug" | "name" | "price" | "compareAtPrice" | "images" | "isNew" | "inStock" | "personalizable"
> & { categoryName?: string };

export function ProductCard({ product, priority = false }: { product: CardProduct; priority?: boolean }) {
  const { wishlist, toggleWish, ready } = useBag();
  const wished = ready && wishlist.includes(product.id);
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <article className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="bg-blush relative aspect-[4/5] overflow-hidden rounded-[1.6rem] rounded-t-[10rem]">
          <ProductVisual
            src={product.images[0]}
            alt={product.name}
            priority={priority}
            className="transition-transform duration-700 group-hover:scale-105"
          />
          {product.images[1] && (
            <ProductVisual
              src={product.images[1]}
              alt=""
              className="opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
          <div className="absolute top-[22%] left-3 flex flex-col items-start gap-1.5">
            {product.isNew && <Tag>New in</Tag>}
            {onSale && <Tag tone="dark">Sale</Tag>}
            {!product.inStock && <Tag tone="muted">Made to order</Tag>}
          </div>
        </div>
        <div className="mt-4 px-1 text-center">
          {product.categoryName && <p className="eyebrow !text-[0.6rem]">{product.categoryName}</p>}
          <h3 className="font-display text-bronze mt-1 text-xl leading-tight transition-colors group-hover:text-rose-deep">
            {product.name}
          </h3>
          <p className="mt-1.5 text-sm">
            <span className="text-rose-deep">{formatLKR(product.price)}</span>
            {onSale && <span className="text-muted ml-2 line-through">{formatLKR(product.compareAtPrice!)}</span>}
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggleWish(product.id)}
        aria-pressed={wished}
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        className="bg-ivory/90 text-bronze absolute top-[22%] right-3 flex size-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition hover:scale-110 hover:text-rose"
      >
        <Heart className={`size-4 ${wished ? "fill-rose text-rose" : ""}`} strokeWidth={1.5} />
      </button>
    </article>
  );
}

function Tag({ children, tone = "rose" }: { children: React.ReactNode; tone?: "rose" | "dark" | "muted" }) {
  const styles = {
    rose: "bg-rose-gold text-white",
    dark: "bg-bronze text-cream",
    muted: "bg-ivory/90 text-bronze",
  }[tone];
  return (
    <span className={`rounded-full px-2.5 py-1 text-[0.58rem] tracking-[0.2em] uppercase shadow-sm ${styles}`}>
      {children}
    </span>
  );
}
