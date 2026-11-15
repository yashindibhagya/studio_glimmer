import type { Metadata } from "next";
import Link from "next/link";
import { getFaqs } from "@/lib/data";
import { FaqList } from "@/components/site/faq-list";
import { SparkleRule } from "@/components/site/ornaments";

export const metadata: Metadata = { title: "FAQ", description: "Answers about ordering, personalisation, payment and delivery." };

export default async function FaqPage() {
  const faqs = await getFaqs();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-8 lg:pt-14">
      <header className="text-center">
        <p className="eyebrow mb-3">Good to know</p>
        <h1 className="font-display text-bronze text-5xl sm:text-6xl">
          <span className="font-script text-rose-gold mr-3 text-6xl sm:text-7xl">Your</span>Questions
        </h1>
        <SparkleRule className="mt-5" />
      </header>
      <FaqList faqs={faqs} />
      <p className="text-muted mt-12 text-center">
        Still wondering? <Link href="/about#contact" className="text-rose-deep underline underline-offset-4">Get in touch</Link>
      </p>
    </div>
  );
}
