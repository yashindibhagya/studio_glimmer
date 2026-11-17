import { getCategories, getSettings } from "@/lib/data";
import { BagProvider } from "@/components/site/bag-context";
import { BagDrawer } from "@/components/site/bag-drawer";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PromoBar } from "@/components/site/promo-bar";
import { VisitTracker } from "@/components/site/visit-tracker";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  return (
    <BagProvider>
      <a href="#main" className="bg-bronze text-cream sr-only z-50 px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      {settings.promoEnabled && <PromoBar text={settings.promoText} />}
      <Header categories={categories.map(({ id, slug, name }) => ({ id, slug, name }))} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} categories={categories} />
      <BagDrawer whatsappNumber={settings.whatsappNumber} />
      <WhatsAppFloat number={settings.whatsappNumber} />
      <VisitTracker />
    </BagProvider>
  );
}
