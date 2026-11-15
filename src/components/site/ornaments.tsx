import type { SVGProps } from "react";

/** Four-point sparkle, like the ones around the logo ring. */
export function Sparkle({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} {...props}>
      <path
        d="M12 0c.6 5.7 2.4 9.9 12 12-9.6 2.1-11.4 6.3-12 12-.6-5.7-2.4-9.9-12-12 9.6-2.1 11.4-6.3 12-12Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Line-art diamond from the logo. */
export function Diamond({ className, strokeWidth = 1.2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 64 52" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round">
      <path d="M14 2h36l12 14-30 34L2 16 14 2Z" />
      <path d="M2 16h60M14 2l8 14 10-14 10 14 8-14M22 16l10 34 10-34" />
    </svg>
  );
}

/** Thin rule with a centred sparkle, used under section titles. */
export function SparkleRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-rose ${className}`} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-rose/60" />
      <Sparkle className="size-3" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-rose/60" />
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  script,
  title,
  align = "center",
}: {
  eyebrow?: string;
  script?: string;
  title: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="font-display text-4xl leading-none text-bronze sm:text-5xl">
        {script && <span className="font-script text-rose-gold mr-3 text-5xl sm:text-6xl">{script}</span>}
        {title}
      </h2>
      {align === "center" && <SparkleRule className="mt-5" />}
    </div>
  );
}
