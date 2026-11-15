import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "./whatsapp-icon";

export function WhatsAppFloat({ number }: { number: string }) {
  if (!number) return null;
  return (
    <a
      href={whatsappLink(number, "Hi Studio Glimmer! ✨ I have a question —")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed right-4 bottom-4 z-30 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_12px_30px_-10px_rgb(37_211_102/0.7)] transition hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="size-6" />
      <span className="hidden max-w-0 overflow-hidden text-sm whitespace-nowrap transition-all duration-300 group-hover:max-w-40 sm:inline">
        Chat with us
      </span>
    </a>
  );
}
