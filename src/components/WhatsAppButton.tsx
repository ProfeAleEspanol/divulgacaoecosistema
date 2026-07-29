import { siteContent } from "@/data/site-content";
import { getWhatsAppHref } from "@/lib/whatsapp";

export function WhatsAppButton() {
  const href = getWhatsAppHref(
    siteContent.contacts.whatsappNumber,
    siteContent.contacts.whatsappMessage,
  );

  if (!href) {
    return null;
  }

  return (
    <a
      className="fixed bottom-5 right-5 z-40 rounded-[8px] bg-inema-teal px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-graphite-950"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      Falar com {siteContent.contacts.whatsappContactName}
    </a>
  );
}
