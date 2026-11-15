import Link from "next/link";
import { Diamond } from "@/components/site/ornaments";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center px-4 py-28 text-center">
      <Diamond className="text-rose w-14" />
      <p className="font-script text-rose-gold mt-6 text-6xl">Oops</p>
      <h1 className="font-display text-bronze text-4xl">This page lost its sparkle</h1>
      <p className="text-muted mt-3">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/shop" className="btn-primary mt-8">Back to the shop</Link>
    </div>
  );
}
