import type { Metadata } from "next";
import Link from "next/link";
import { getGallery, getReviews, getSettings } from "@/lib/data";
import { ProductVisual } from "@/components/site/product-visual";
import { ReviewCards } from "@/components/site/review-cards";
import { SectionTitle, Sparkle, SparkleRule } from "@/components/site/ornaments";
import { InstagramIcon } from "@/components/site/whatsapp-icon";

export const metadata: Metadata = {
  title: "Gallery & Reviews",
  description: "Finished custom pieces and kind words from Studio Glimmer customers.",
};

export default async function GalleryPage() {
  const [gallery, reviews, settings] = await Promise.all([getGallery(), getReviews(), getSettings()]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-8 lg:pt-14">
      <header className="text-center">
        <p className="eyebrow mb-3">Past creations</p>
        <h1 className="font-display text-bronze text-5xl sm:text-6xl">
          <span className="font-script text-rose-gold mr-3 text-6xl sm:text-7xl">Our</span>Gallery
        </h1>
        <SparkleRule className="mt-5" />
      </header>

      {gallery.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Sparkle className="text-rose-light size-8" />
          <p className="font-display text-bronze text-2xl">New photos coming soon</p>
          <p className="text-muted text-sm">In the meantime, see our latest pieces on Instagram.</p>
          <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-2">
            <InstagramIcon className="size-4" /> Visit Instagram
          </a>
        </div>
      ) : (
        <div className="mt-12 columns-2 gap-4 sm:gap-6 lg:columns-3">
          {gallery.map((g, i) => (
            <figure key={g.id} className="group mb-4 break-inside-avoid sm:mb-6">
              <div className={`bg-blush relative overflow-hidden ${i % 3 === 0 ? "aspect-[3/4] rounded-t-full rounded-b-3xl" : i % 3 === 1 ? "aspect-square rounded-3xl" : "aspect-[4/5] rounded-3xl"}`}>
                <ProductVisual src={g.image} alt={g.caption || "Studio Glimmer creation"} sizes="(min-width:1024px) 33vw, 50vw" className="transition-transform duration-700 group-hover:scale-105" />
              </div>
              {g.caption && <figcaption className="text-muted mt-2 text-center text-sm">{g.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      {reviews.length > 0 && (
        <section className="mt-24">
          <SectionTitle eyebrow="Kind words" script="Happy" title="Customers" />
          <ReviewCards reviews={reviews} />
        </section>
      )}

      <div className="mt-20 text-center">
        <p className="font-display text-bronze text-3xl">Want something like this?</p>
        <Link href="/custom-order" className="btn-primary mt-6">Start a custom order</Link>
      </div>
    </div>
  );
}
