import Image from "next/image";
import { Diamond, Sparkle } from "./ornaments";

/**
 * Product photo, or — until a real photo is uploaded — an elegant
 * rose-gold placeholder so the shop still looks finished.
 */
export function ProductVisual({
  src,
  alt,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority = false,
  className = "",
}: {
  src?: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`absolute inset-0 flex items-center justify-center overflow-hidden bg-placeholder ${className}`}
    >
      <div className="absolute size-[78%] rounded-full border border-rose/40" />
      <div className="absolute size-[70%] rounded-full border border-rose/15" />
      <Diamond className="text-rose/80 w-[34%]" strokeWidth={1} />
      <Sparkle className="text-rose-light animate-twinkle absolute top-[16%] right-[20%] size-5" />
      <Sparkle className="text-rose/70 animate-twinkle absolute bottom-[20%] left-[18%] size-3 [animation-delay:1.2s]" />
      <Sparkle className="animate-twinkle absolute top-[30%] left-[24%] size-2.5 text-white dark:text-rose-light [animation-delay:2s]" />
    </div>
  );
}
