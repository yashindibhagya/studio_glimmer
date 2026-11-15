import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageCircle, PenLine, Gift } from "lucide-react";
import { formatLKR } from "@/lib/format";
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

  const newIn = [...products]
    .sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4)
    .map(withCat);
  const newIds = new Set(newIn.map((p) => p.id));
  const featured = products.filter((p) => p.featured && !newIds.has(p.id)).slice(0, 4).map(withCat);
  const spotlight = products.find((p) => p.featured) ?? products[0];

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
                <>
                  <Image src={settings.heroImage} alt="Studio Glimmer creation" fill priority sizes="(min-width: 1024px) 42vw, 92vw" className="object-cover" />
                  <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_35%,#fbf6ec_0%,#eee3cf_55%,#dccdb1_100%)]">
                  <Image src="/logo.webp" alt="Studio Glimmer logo" width={420} height={420} priority className="-mt-10 w-[88%] mix-blend-multiply [mask-image:radial-gradient(circle_closest-side,black_84%,transparent_100%)]" />
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

            {/* Featured product card */}
            {spotlight && (
              <Link
                href={`/product/${spotlight.slug}`}
                className="group bg-ivory/85 absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-[1.4rem] border border-white/50 p-2.5 shadow-lg backdrop-blur-md transition hover:bg-ivory"
              >
                <span className="bg-blush relative size-14 shrink-0 overflow-hidden rounded-2xl">
                  <ProductVisual src={spotlight.images[0]} alt="" sizes="56px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="eyebrow block !text-[0.56rem]">Customer favourite</span>
                  <span className="font-display text-bronze block truncate text-lg leading-tight">{spotlight.name}</span>
                  <span className="text-rose-deep block text-xs">{formatLKR(spotlight.price)}</span>
                </span>
                <span className="bg-bronze text-cream mr-1 flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            )}
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

      {/* ---------- CATEGORIES ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
        <SectionTitle eyebrow="Shop by category" script="Find your" title="Sparkle" />
        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((c, i) => {
            const cover = c.image ?? products.find((p) => p.categoryId === c.id && p.images[0])?.images[0];
            return (
              <Link key={c.id} href={`/shop?category=${c.slug}`} className={`group text-center ${i === 4 ? "col-span-2 mx-auto w-1/2 md:col-span-1 md:w-full" : ""}`}>
                <div className="bg-blush relative aspect-[3/4] overflow-hidden rounded-t-full rounded-b-3xl">
                  <ProductVisual src={cover} alt={c.name} sizes="(min-width:1024px) 20vw, 45vw" className="transition-transform duration-700 group-hover:scale-105" />
                </div>
                <h3 className="font-display text-bronze mt-4 text-xl leading-tight transition-colors group-hover:text-rose-deep">{c.name}</h3>
                <p className="text-muted mt-1 hidden text-xs sm:block">{c.tagline}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------- NEW IN ---------- */}
      <section className="bg-ivory py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
            <SectionTitle eyebrow="Fresh from the studio" script="New" title="Arrivals" align="left" />
            <Link href="/shop?sort=new" className="btn-outline">View all <ArrowRight className="size-4" /></Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
            {newIn.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 2} />)}
          </div>
        </div>
      </section>

      {/* ---------- BRAND STORY ---------- */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
        <div className="relative mx-auto w-full max-w-md">
          <div className="bg-blush relative aspect-square overflow-hidden rounded-full">
            {settings.aboutImage ? (
              <Image src={settings.aboutImage} alt="Inside the Studio Glimmer studio" fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle,#fbf6ec,#dccdb1)]">
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

      {/* ---------- FEATURED ---------- */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-8 lg:pb-28">
          <SectionTitle eyebrow="Customer favourites" script="Most" title="Loved" />
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ---------- CUSTOM ORDER CTA ---------- */}
      <section className="bg-bronze text-cream relative overflow-hidden">
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

      {/* ---------- GALLERY / INSTAGRAM ---------- */}
      <section className="bg-blush/50 py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="text-center lg:text-left">
            <p className="eyebrow mb-3">Follow the sparkle</p>
            <h2 className="font-display text-bronze text-4xl sm:text-5xl">@studioglimmer.lk</h2>
            <SparkleRule className="mt-5 lg:justify-start" />
            <p className="text-muted mt-6 leading-relaxed">
              Behind-the-scenes, new drops and finished custom pieces — see it all first on Instagram.
            </p>
            <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row lg:items-center">
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <InstagramIcon className="size-4" /> Follow us
              </a>
              <div className="bg-ivory ring-rose-gold hidden rounded-2xl p-2 sm:block">
                <Image src="/instagram-qr.png" alt="Scan to open Studio Glimmer on Instagram" width={92} height={109} className="rounded-lg" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {(gallery.length ? gallery.slice(0, 6).map((g) => ({ id: g.id, src: g.image as string | undefined, alt: g.caption })) : products.slice(0, 6).map((p) => ({ id: p.id, src: p.images[0], alt: p.name }))).map((g, i) => (
              <Link key={g.id} href="/gallery" className={`bg-blush relative aspect-square overflow-hidden ${i % 2 ? "rounded-3xl" : "rounded-t-full rounded-b-3xl"}`}>
                <ProductVisual src={g.src} alt={g.alt} sizes="(min-width:1024px) 18vw, 30vw" className="transition-transform duration-700 hover:scale-105" />
              </Link>
            ))}
          </div>
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
