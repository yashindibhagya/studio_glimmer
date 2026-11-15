import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSettings } from "@/lib/data";
import { POLICY_TITLES } from "@/lib/policies";
import type { PolicyKey } from "@/lib/types";
import { SparkleRule } from "@/components/site/ornaments";

export function generateStaticParams() {
  return Object.keys(POLICY_TITLES).map((key) => ({ key }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[key]">): Promise<Metadata> {
  const { key } = await params;
  return { title: POLICY_TITLES[key as PolicyKey] ?? "Policy" };
}

export default function PolicyPage({ params }: PageProps<"/policies/[key]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <PolicyContent params={params} />
    </Suspense>
  );
}

async function PolicyContent({ params }: Pick<PageProps<"/policies/[key]">, "params">) {
  const { key } = await params;
  if (!(key in POLICY_TITLES)) notFound();
  const settings = await getSettings();
  const body = settings.policies[key as PolicyKey];

  return (
    <article className="mx-auto max-w-2xl px-4 pt-10 pb-24 sm:px-8 lg:pt-14">
      <header className="text-center">
        <p className="eyebrow mb-3">Information</p>
        <h1 className="font-display text-bronze text-4xl sm:text-5xl">{POLICY_TITLES[key as PolicyKey]}</h1>
        <SparkleRule className="mt-5" />
      </header>
      <div className="prose-glimmer text-muted mt-12 leading-relaxed">
        {body.split(/\n\s*\n/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
      </div>
    </article>
  );
}
