"use client";

import { houseWhatsappLink, useSiteContact } from "@/lib/content/useSiteContact";
import { usePathname } from "next/navigation";

/** Floating chat button to the house's WhatsApp; hidden until a number is set in the CMS. */
export default function WhatsAppButton() {
  const pathname = usePathname();
  const { whatsapp, whatsappGreeting } = useSiteContact();
  const href = houseWhatsappLink(whatsapp, whatsappGreeting);

  if (!href || pathname?.startsWith("/admin")) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Kesari on WhatsApp"
      className="fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full bg-[#25d366] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)] transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff" aria-hidden>
        <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.3-1.4A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3a8.2 8.2 0 1 1 7 3.9Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
      </svg>
    </a>
  );
}
