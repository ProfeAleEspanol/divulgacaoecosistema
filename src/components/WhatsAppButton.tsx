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
    <section className="bg-inema-teal px-5 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">
            Contato direto
          </p>
          <p className="mt-1 text-lg font-bold">
            Falar com {siteContent.contacts.whatsappContactName}
          </p>
        </div>
        <a
          className="inline-flex rounded-[8px] bg-white px-5 py-3 text-sm font-bold text-graphite-950 shadow-soft transition hover:bg-inema-gold"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          Abrir WhatsApp
        </a>
      </div>
    </section>
  );
}
