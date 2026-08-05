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
    aiBrief: null,
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

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(text.slice(start, end + 1)) as {
      executiveSummary?: string;
      firstAction?: string;
      suggestedNextActions?: string[];
      riskNotes?: string[];
    };
  } catch {
    return null;
  }
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
          "Você é um consultor sênior de IA para pequenas e médias empresas. Escreva em português do Brasil, com clareza, sem promessas financeiras irreais e com recomendações práticas. Retorne somente JSON válido.",
        input: [
          {
            role: "user",
            content: JSON.stringify({
              tarefa:
                "Reescreva o resumo executivo em até 110 palavras e devolva também firstAction, suggestedNextActions com 3 itens e riskNotes com 2 itens. Mantenha estimativas como indicativas.",
              formato: {
                executiveSummary: "string",
                firstAction: "string",
                suggestedNextActions: ["string", "string", "string"],
                riskNotes: ["string", "string"],
              },
              diagnosis: body.diagnosis,
              report: body.report,
            }),
          },
        ],
        max_output_tokens: 520,
      }),
    });

    if (!response.ok) {
      return localResponse(body.report?.executiveSummary);
    }

    const data = (await response.json()) as unknown;
    const outputText = extractOutputText(data);
    const parsed = outputText ? extractJsonObject(outputText) : null;

    return NextResponse.json({
      source: parsed ? "openai" : "rules",
      executiveSummary:
        parsed?.executiveSummary ?? outputText ?? body.report?.executiveSummary ?? null,
      aiBrief: parsed
        ? {
            source: "openai",
            firstAction: parsed.firstAction ?? "",
            suggestedNextActions: parsed.suggestedNextActions ?? [],
            riskNotes: parsed.riskNotes ?? [],
          }
        : null,
    });
  } catch {
    return localResponse(body.report?.executiveSummary);
  }
}
