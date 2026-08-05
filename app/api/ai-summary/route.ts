import { NextResponse } from "next/server";

type AiSummaryRequest = {
  diagnosis?: unknown;
  report?: {
    executiveSummary?: string;
    opportunities?: Array<{ title: string; area: string; score: number }>;
    implementationPlan?: unknown;
  };
};

function localResponse(summary?: string) {
  return NextResponse.json({
    source: "rules",
    executiveSummary: summary ?? null,
    note: "Resumo local usado porque a IA generativa não está configurada.",
  });
}

function extractOutputText(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "output_text" in data &&
    typeof data.output_text === "string"
  ) {
    return data.output_text;
  }

  return null;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-5";
  const body = (await request.json().catch(() => ({}))) as AiSummaryRequest;

  if (!apiKey) {
    return localResponse(body.report?.executiveSummary);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions:
          "Você é um consultor sênior de IA para pequenas e médias empresas. Escreva em português do Brasil, com clareza, sem promessas financeiras irreais e com recomendações práticas.",
        input: [
          {
            role: "user",
            content: JSON.stringify({
              tarefa:
                "Reescreva o resumo executivo do mapa de oportunidades em até 110 palavras e destaque a primeira ação recomendada. Mantenha as estimativas como indicativas.",
              diagnosis: body.diagnosis,
              report: body.report,
            }),
          },
        ],
        max_output_tokens: 360,
      }),
    });

    if (!response.ok) {
      return localResponse(body.report?.executiveSummary);
    }

    const data = (await response.json()) as unknown;
    const executiveSummary = extractOutputText(data);

    return NextResponse.json({
      source: executiveSummary ? "openai" : "rules",
      executiveSummary: executiveSummary ?? body.report?.executiveSummary ?? null,
    });
  } catch {
    return localResponse(body.report?.executiveSummary);
  }
}
