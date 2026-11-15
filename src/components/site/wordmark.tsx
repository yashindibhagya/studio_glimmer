import Link from "next/link";
import { Diamond } from "./ornaments";

/** Compact header version of the logo: script "Studio" over spaced "GLIMMER". */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Studio Glimmer — home" className={`group inline-flex items-end gap-1.5 ${className}`}>
      <span className="flex flex-col items-center leading-none">
        <span className="font-script text-rose-gold -mb-1.5 text-[1.9rem] sm:text-[2.2rem]">Studio</span>
        <span className="font-display text-bronze pl-[0.45em] text-[0.82rem] tracking-[0.45em] sm:text-[0.95rem]">
          GLIMMER
        </span>
      </span>
      <Diamond className="text-rose mb-3 h-3.5 w-4 transition-transform duration-500 group-hover:rotate-12" />
    </Link>
  );
}
