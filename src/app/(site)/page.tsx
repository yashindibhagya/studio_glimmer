import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageCircle, PenLine, Gift } from "lucide-react";
import { getCategories, getFaqs, getGallery, getProducts, getReviews, getSettings } from "@/lib/data";
import { ProductCard } from "@/components/site/product-card";
import { ProductVisual } from "@/components/site/product-visual";
import { Diamond, SectionTitle, Sparkle, SparkleRule } from "@/components/site/ornaments";
import { FaqList } from "@/components/site/faq-list";
import { ReviewCards } from "@/components/site/review-cards";
import { InstagramIcon } from "@/components/site/whatsapp-icon";

export default async function HomePage() {
  const [settings, categories, products, reviews, faqs, gallery] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts(),
    getReviews(),
    getFaqs(),
    getGallery(),
  ]);

  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const withCat = <T extends { categoryId: string }>(p: T) => ({ ...p, categoryName: catName.get(p.categoryId) });

  // Small catalogue: one short row, favourites first, then the newest pieces.
  const picks = [...products]
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) || Number(b.isNew) - Number(a.isNew) || b.createdAt.localeCompare(a.createdAt),
    )
    .slice(0, 4)
    .map(withCat);
  const galleryShots = gallery.slice(0, 3);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        {/* Background: oversized outlined wordmark + soft rose-gold glow */}
        <p
          aria-hidden
          className="font-display pointer-events-none absolute -top-6 right-[-2vw] hidden text-[21vw] leading-none font-semibold tracking-tight text-transparent select-none [-webkit-text-stroke:1px_rgb(29_27_25/0.08)] lg:block"
        >
          GLIMMER
        </p>
        <div aria-hidden className="bg-rose-light/45 pointer-events-none absolute top-[18%] right-[6%] size-[30rem] rounded-full blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pt-10 pb-16 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:pt-16 lg:pb-24">
          {/* Copy */}
          <div className="animate-fade-up">
            <p className="border-line bg-ivory/70 text-bronze inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-[0.66rem] tracking-[0.22em] uppercase backdrop-blur">
              <span className="relative flex size-2">
                <span className="bg-rose absolute inline-flex size-full animate-ping rounded-full opacity-60" />
                <span className="bg-rose relative inline-flex size-2 rounded-full" />
              </span>
              {settings.heroEyebrow}
            </p>
            <h1 className="text-bronze mt-6">
              <span className="font-script text-rose-gold -mb-3 -ml-1 block py-2 text-[5.5rem] leading-none sm:-mb-5 sm:text-[8rem] lg:-mb-7 lg:text-[10rem]">
                {settings.heroScript}
              </span>
              <span className="font-display block text-[3.3rem] leading-[0.92] font-medium tracking-tight sm:text-7xl lg:text-[6.2rem]">
                {settings.heroTitle}
              </span>
            </h1>
            <p className="text-muted mt-7 max-w-md text-lg leading-relaxed">{settings.heroSubtitle}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link href="/shop" className="btn-primary group !py-2.5 !pr-2.5">
                Explore the collection
                <span className="bg-cream text-bronze flex size-9 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
              <Link
                href="/custom-order"
                className="text-bronze decoration-rose text-[0.72rem] tracking-[0.24em] uppercase underline decoration-1 underline-offset-8 transition hover:text-rose-deep"
              >
                Create something custom
              </Link>
            </div>
            <dl className="border-line mt-12 flex max-w-lg justify-between gap-6 border-t pt-7">
              {settings.stats.map((s) => (
                <div key={s.label}>
                  <dd className="font-display text-bronze text-3xl leading-none sm:text-4xl">{s.value}</dd>
                  <dt className="eyebrow mt-2 !text-[0.58rem] sm:!text-[0.62rem]">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Visual */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="bg-blush relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-[0_45px_80px_-45px_rgb(29_27_25/0.6)] transition-transform duration-700 lg:rotate-[1.5deg] lg:hover:rotate-0">
              {settings.heroImage ? (
                <Image src={settings.heroImage} alt="Studio Glimmer creation" fill priority sizes="(min-width: 1024px) 42vw, 92vw" className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-placeholder">
                  <Image src="/logo.webp" alt="Studio Glimmer logo" width={420} height={420} priority className="-mt-10 w-[88%] logo-blend [mask-image:radial-gradient(circle_closest-side,black_84%,transparent_100%)]" />
                </div>
              )}
            </div>

            {/* Floating chip */}
            <p className="bg-ivory/85 text-bronze absolute top-8 -left-2 flex items-center gap-2 rounded-full border border-white/50 px-4 py-2.5 text-[0.62rem] tracking-[0.2em] uppercase shadow-lg backdrop-blur-md sm:-left-6">
              <Sparkle className="text-rose size-3" /> Hand-placed, stone by stone
            </p>

            {/* Rotating badge */}
            <div className="bg-bronze text-cream absolute -top-7 right-3 flex size-24 items-center justify-center rounded-full shadow-xl sm:size-28 lg:-right-6" aria-hidden>
              <svg viewBox="0 0 100 100" className="animate-spin-slow absolute inset-0 size-full">
                <defs>
                  <path id="hero-badge-path" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
                </defs>
                <text fontSize="8" fill="currentColor" className="font-sans tracking-widest uppercase">
                  <textPath href="#hero-badge-path" textLength="226" lengthAdjust="spacing">
                    Custom rhinestone creations ✦ Since 2020 ✦
                  </textPath>
                </text>
              </svg>
              <Diamond className="text-rose-light w-8" strokeWidth={1.4} />
            </div>

          </div>
        </div>
      </section>

      {/* ---------- MARQUEE ---------- */}
      <div className="bg-rose-gold overflow-hidden py-4 text-white" aria-hidden>
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-10">
              {[...categories.map((c) => c.name), "Custom orders", "Personalised gifts"].map((t, i) => (
                <span key={`${k}-${i}`} className="font-display flex items-center gap-10 text-xl tracking-[0.15em] uppercase">
                  {t} <Sparkle className="size-3" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- CATEGORIES (no photos needed) ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-24">
        <SectionTitle eyebrow="Shop by category" script="Find your" title="Sparkle" />
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="group bg-ivory border-line hover:border-rose flex w-full items-center gap-4 rounded-3xl border p-5 transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-30px_rgb(29_27_25/0.5)] sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]"
            >
              <span className="bg-blush text-rose-deep flex size-12 shrink-0 items-center justify-center rounded-full">
                <Sparkle className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-display text-bronze block text-xl leading-tight">{c.name}</span>
                {c.tagline && <span className="text-muted mt-0.5 block truncate text-xs">{c.tagline}</span>}
              </span>
              <ArrowUpRight className="text-bronze size-4 shrink-0 transition-transform duration-300 group-hover:rotate-45" />
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- COLLECTION ---------- */}
      {picks.length > 0 && (
        <section className="bg-ivory py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <SectionTitle eyebrow="Fresh from the studio" script="Our" title="Collection" />
            <div className="mt-12 flex flex-wrap justify-center gap-x-4 gap-y-12 sm:gap-x-6">
              {picks.map((p, i) => (
                <div key={p.id} className="w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]">
                  <ProductCard product={p} priority={i < 2} />
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/shop" className="btn-outline">View all <ArrowRight className="size-4" /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------- BRAND STORY ---------- */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
        <div className="relative mx-auto w-full max-w-md">
          <div className="bg-blush relative aspect-square overflow-hidden rounded-full">
            {settings.aboutImage ? (
              <Image src={settings.aboutImage} alt="Inside the Studio Glimmer studio" fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-placeholder">
                <Diamond className="text-rose w-1/3" strokeWidth={0.8} />
              </div>
            )}
          </div>
          <div className="border-rose/40 pointer-events-none absolute -inset-4 rounded-full border" />
          <div className="bg-cream ring-rose-gold absolute -right-2 bottom-6 rounded-full px-6 py-4 text-center shadow-lg sm:right-0">
            <p className="font-script text-rose-gold text-3xl leading-none">Since</p>
            <p className="font-display text-bronze text-2xl tracking-widest">2020</p>
          </div>
        </div>
        <div className="text-center lg:text-left">
          <p className="eyebrow mb-3">Our story</p>
          <h2 className="font-display text-bronze text-4xl sm:text-5xl">{settings.aboutTitle}</h2>
          <SparkleRule className="mt-5 lg:justify-start" />
          <div className="prose-glimmer text-muted mt-6 leading-relaxed">
            {settings.aboutText.split(/\n\s*\n/).slice(0, 2).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <Link href="/about" className="btn-outline mt-8">Read more</Link>
        </div>
      </section>

      {/* ---------- CUSTOM ORDER CTA ---------- */}
      <section className="keep-dark bg-bronze text-cream relative overflow-hidden">
        <Sparkle className="text-rose-light/40 animate-twinkle absolute top-10 left-[8%] size-6" />
        <Sparkle className="text-rose-light/30 animate-twinkle absolute right-[10%] bottom-12 size-10 [animation-delay:1.5s]" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-24">
          <div className="text-center">
            <p className="eyebrow !text-rose-light mb-3">Made just for you</p>
            <h2 className="font-display text-4xl sm:text-5xl">
              <span className="font-script text-rose-light mr-3 text-5xl sm:text-6xl">Dreaming</span>
              of something one-of-a-kind?
            </h2>
            <p className="text-cream/70 mx-auto mt-5 max-w-xl">
              Names, dates, logos, wedding themes — tell us your idea and we&apos;ll bring it to life in crystals.
            </p>
          </div>
          <ol className="mx-auto mt-14 grid max-w-4xl gap-10 sm:grid-cols-3">
            {[
              { Icon: PenLine, title: "Share your idea", text: "Fill in the custom order form with your idea and reference photos." },
              { Icon: MessageCircle, title: "We design & quote", text: "We'll message you on WhatsApp with the design, price and timeline." },
              { Icon: Gift, title: "Made & delivered", text: "Your piece is hand-crafted and delivered anywhere in Sri Lanka." },
            ].map(({ Icon, title, text }, i) => (
              <li key={title} className="text-center">
                <div className="border-rose-light/40 mx-auto flex size-16 items-center justify-center rounded-full border">
                  <Icon className="text-rose-light size-6" strokeWidth={1.3} />
                </div>
                <p className="eyebrow !text-rose-light mt-5">Step {i + 1}</p>
                <h3 className="font-display mt-1 text-2xl">{title}</h3>
                <p className="text-cream/65 mt-2 text-sm leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 text-center">
            <Link href="/custom-order" className="btn-primary btn-gold">Start a custom order <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </section>

      {/* ---------- REVIEWS ---------- */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
          <SectionTitle eyebrow="Kind words" script="Happy" title="Customers" />
          <ReviewCards reviews={reviews.slice(0, 3)} />
        </section>
      )}

      {/* ---------- INSTAGRAM (photos only once the gallery has some) ---------- */}
      <section className="bg-blush/50 py-20 lg:py-24">
        <div className={`mx-auto items-center gap-12 px-4 sm:px-8 ${galleryShots.length === 3 ? "grid max-w-7xl lg:grid-cols-[1fr_1.4fr]" : "max-w-2xl"}`}>
          <div className={`text-center ${galleryShots.length === 3 ? "lg:text-left" : ""}`}>
            <p className="eyebrow mb-3">Follow the sparkle</p>
            <h2 className="font-display text-bronze text-4xl sm:text-5xl">@studioglimmer.lk</h2>
            <SparkleRule className={`mt-5 ${galleryShots.length === 3 ? "lg:justify-start" : ""}`} />
            <p className="text-muted mt-6 leading-relaxed">
              Behind-the-scenes, new drops and finished custom pieces — see it all first on Instagram.
            </p>
            <div className={`mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row ${galleryShots.length === 3 ? "lg:justify-start" : ""}`}>
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <InstagramIcon className="size-4" /> Follow us
              </a>
              <div className="bg-ivory ring-rose-gold hidden rounded-2xl p-2 sm:block">
                <Image src="/instagram-qr.png" alt="Scan to open Studio Glimmer on Instagram" width={92} height={109} className="rounded-lg" />
              </div>
            </div>
          </div>
          {galleryShots.length === 3 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {galleryShots.map((g, i) => (
                <Link key={g.id} href="/gallery" className={`bg-blush relative aspect-square overflow-hidden ${i % 2 ? "rounded-3xl" : "rounded-t-full rounded-b-3xl"}`}>
                  <ProductVisual src={g.image} alt={g.caption} sizes="(min-width:1024px) 18vw, 30vw" className="transition-transform duration-700 hover:scale-105" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-8 lg:py-28">
        <SectionTitle eyebrow="Good to know" script="Your" title="Questions" />
        <FaqList faqs={faqs.slice(0, 5)} />
        <div className="mt-10 text-center">
          <Link href="/faq" className="btn-outline">All FAQs</Link>
        </div>
      </section>
    </>
  );
}
