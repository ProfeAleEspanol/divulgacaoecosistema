import { siteContent } from "@/data/site-content";
import { getWhatsAppHref } from "@/lib/whatsapp";

export type InterestLead = {
  name: string;
  whatsapp: string;
  email: string;
  cityState: string;
  profession: string;
  aiLevel: string;
  project: string;
  immersiveInterest: string;
  periodPreference: string;
  notes: string;
  consent: boolean;
};

export type SubmitInterestResult = {
  mode: "api" | "whatsapp";
  reference: string;
  message: string;
  href?: string;
};

function createReference() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `lead-${Date.now()}`;
}

function formatWhatsAppMessage(record: InterestLead & { reference: string }) {
  return [
    siteContent.contacts.whatsappMessage,
    "",
    `Protocolo: ${record.reference}`,
    `Nome: ${record.name}`,
    `WhatsApp: ${record.whatsapp}`,
    `E-mail: ${record.email}`,
    `Empresa/instituição: ${record.cityState}`,
    `Cargo/área: ${record.profession}`,
    `Nível de IA: ${record.aiLevel}`,
    `Interesse: ${record.immersiveInterest}`,
    `Momento: ${record.periodPreference}`,
    "",
    "Contexto:",
    record.project,
    "",
    record.notes ? `Observações: ${record.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function submitInterestLead(
  payload: InterestLead,
): Promise<SubmitInterestResult> {
  const reference = createReference();
  const submittedAt = new Date().toISOString();
  const record = { ...payload, reference, submittedAt };
  const endpoint = process.env.NEXT_PUBLIC_INTEREST_API_URL;

  // Configure NEXT_PUBLIC_INTEREST_API_URL when a CRM, webhook, Supabase
  // function, or another HTTP lead receiver is available.
  if (endpoint) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      throw new Error("Não foi possível enviar o formulário agora.");
    }

    return {
      mode: "api",
      reference,
      message: "Envio registrado pela integração configurada.",
    };
  }

  const href = getWhatsAppHref(
    siteContent.contacts.whatsappNumber,
    formatWhatsAppMessage(record),
  );

  if (!href) {
    throw new Error("Não foi possível preparar o contato pelo WhatsApp.");
  }

  return {
    mode: "whatsapp",
    reference,
    href,
    message: "Contato preparado para envio pelo WhatsApp.",
  };
}
