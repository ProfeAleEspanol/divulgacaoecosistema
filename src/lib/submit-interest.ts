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
  mode: "api" | "local";
  reference: string;
  message: string;
};

const storageKey = "inema-interest-leads";

function createReference() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `lead-${Date.now()}`;
}

function readStoredLeads() {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as unknown[];
  } catch {
    return [];
  }
}

export async function submitInterestLead(
  payload: InterestLead,
): Promise<SubmitInterestResult> {
  const reference = createReference();
  const submittedAt = new Date().toISOString();
  const record = { ...payload, reference, submittedAt };
  const endpoint = process.env.NEXT_PUBLIC_INTEREST_API_URL;

  // Configure NEXT_PUBLIC_INTEREST_API_URL to send leads to Supabase Edge Functions,
  // a route handler, or any HTTP API that accepts this JSON payload.
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

  if (typeof window !== "undefined") {
    const leads = readStoredLeads();
    window.localStorage.setItem(storageKey, JSON.stringify([...leads, record]));
  }

  return {
    mode: "local",
    reference,
    message:
      "Modo demonstração: os dados foram salvos neste navegador. Configure NEXT_PUBLIC_INTEREST_API_URL para envio real.",
  };
}
