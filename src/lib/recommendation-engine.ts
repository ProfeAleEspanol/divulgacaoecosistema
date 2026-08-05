import { opportunityCatalog } from "../data/opportunities";
import type {
  BusinessArea,
  BusinessGoal,
  DiagnosisAnswers,
  EffortLevel,
  ImpactLevel,
  ImplementationPlan,
  OpportunityMap,
  OpportunityTemplate,
  PriorityLevel,
  RecommendedOpportunity,
} from "../types/inema-map";

const maturityBaseScore = {
  nenhuma: 14,
  inicial: 36,
  intermediaria: 62,
  avancada: 82,
} as const;

const goalLabels: Record<BusinessGoal, string> = {
  "reduzir-custos": "reduzir custos",
  "ganhar-tempo": "ganhar tempo",
  "vender-mais": "vender mais",
  "melhorar-atendimento": "melhorar o atendimento",
  "organizar-gestao": "organizar a gestão",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, " ");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasKeywordMatch(searchableText: string, keyword: string) {
  const normalizedKeyword = normalizeText(keyword).trim();

  if (!normalizedKeyword) {
    return false;
  }

  if (normalizedKeyword.includes(" ") || normalizedKeyword.includes("-")) {
    return searchableText.includes(normalizedKeyword);
  }

  return new RegExp(`(^|\\s)${escapeRegExp(normalizedKeyword)}($|\\s)`).test(
    searchableText,
  );
}

export function getProblemList(answers: DiagnosisAnswers) {
  const customProblems = answers.customProblems
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return [...answers.currentProblems, ...customProblems];
}

function getToolList(answers: DiagnosisAnswers) {
  const customTools = answers.customTools
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return [...answers.toolsUsed, ...customTools];
}

function toImpactLevel(score: number): ImpactLevel {
  if (score >= 5) {
    return "Muito alto";
  }

  if (score >= 4) {
    return "Alto";
  }

  if (score >= 3) {
    return "Médio";
  }

  return "Baixo";
}

function toEffortLevel(score: number): EffortLevel {
  if (score <= 2) {
    return "Baixo";
  }

  if (score === 3) {
    return "Médio";
  }

  return "Alto";
}

function toPriorityLevel(score: number): PriorityLevel {
  if (score >= 78) {
    return "Alta";
  }

  if (score >= 58) {
    return "Média";
  }

  return "Exploratória";
}

function formatAreas(areas: BusinessArea[]) {
  if (areas.length === 0) {
    return "áreas ainda não definidas";
  }

  if (areas.length === 1) {
    return areas[0].toLowerCase();
  }

  return `${areas.slice(0, -1).join(", ").toLowerCase()} e ${areas
    .slice(-1)[0]
    .toLowerCase()}`;
}

function getHoursPressure(answers: DiagnosisAnswers, template: OpportunityTemplate) {
  const hours =
    typeof answers.repetitiveHoursPerWeek === "number"
      ? answers.repetitiveHoursPerWeek
      : 0;

  const areaPressure = template.relevantAreas.some((area) =>
    answers.timeConsumingAreas.includes(area),
  )
    ? 1
    : 0.55;

  if (hours >= 30) {
    return 16 * areaPressure;
  }

  if (hours >= 16) {
    return 12 * areaPressure;
  }

  if (hours >= 8) {
    return 8 * areaPressure;
  }

  if (hours > 0) {
    return 4 * areaPressure;
  }

  return 0;
}

function scoreOpportunity(template: OpportunityTemplate, answers: DiagnosisAnswers) {
  const problems = getProblemList(answers);
  const searchableText = normalizeText(
    [
      answers.companyName,
      answers.segment,
      answers.priority,
      answers.goal90Days ? goalLabels[answers.goal90Days] : "",
      answers.timeConsumingAreas.join(" "),
      problems.join(" "),
      answers.toolsUsed.join(" "),
      answers.customTools,
    ].join(" "),
  );

  const keywordMatches = template.triggerKeywords.filter((keyword) =>
    hasKeywordMatch(searchableText, keyword),
  );

  const areaMatches = template.relevantAreas.filter((area) =>
    answers.timeConsumingAreas.includes(area),
  );

  const segmentMatch =
    answers.segment !== "" && template.relevantSegments.includes(answers.segment);
  const goalMatch =
    answers.goal90Days !== "" && template.relevantGoals.includes(answers.goal90Days);
  const priorityMatch =
    answers.priority !== "" && template.relevantPriorities.includes(answers.priority);

  /*
   * Priority scoring is intentionally rule-based for the MVP:
   * relevance from reported problems and time-consuming areas gets the highest
   * weight, then impact, urgency, goal alignment, effort and repetitive hours.
   * This keeps recommendations explainable and makes the catalog expandable
   * without changing the UI.
   */
  const rawScore =
    10 +
    keywordMatches.length * 8 +
    areaMatches.length * 10 +
    (segmentMatch ? 8 : 0) +
    (goalMatch ? 10 : 0) +
    (priorityMatch ? 10 : 0) +
    template.baseImpact * 6 +
    template.urgency * 4 -
    template.effort * 5 +
    getHoursPressure(answers, template);

  const reasons = [
    ...keywordMatches.slice(0, 3).map((keyword) => `conecta com "${keyword}"`),
    ...areaMatches.slice(0, 2).map((area) => `atua em ${area.toLowerCase()}`),
  ];

  if (segmentMatch && answers.segment) {
    reasons.push(`aplicável ao segmento ${answers.segment.toLowerCase()}`);
  }

  if (goalMatch && answers.goal90Days) {
    reasons.push(`apoia o objetivo de ${goalLabels[answers.goal90Days]}`);
  }

  if (priorityMatch && answers.priority) {
    reasons.push(`alinhado à prioridade de ${answers.priority}`);
  }

  return {
    score: Math.round(clamp(rawScore, 0, 100)),
    reasons: reasons.length > 0 ? reasons : ["boa hipótese para validação inicial"],
  };
}

function estimateMonthlyHours(template: OpportunityTemplate, score: number, answers: DiagnosisAnswers) {
  const weeklyHours =
    typeof answers.repetitiveHoursPerWeek === "number"
      ? answers.repetitiveHoursPerWeek
      : 8;
  const timeMultiplier = 0.7 + clamp(weeklyHours, 0, 40) / 45;
  const relevanceMultiplier = 0.55 + score / 125;

  return Math.max(
    3,
    Math.round(template.baseHoursSavedMonthly * timeMultiplier * relevanceMultiplier),
  );
}

function getMaturityScore(answers: DiagnosisAnswers) {
  const base = answers.aiMaturity ? maturityBaseScore[answers.aiMaturity] : 18;
  const tools = getToolList(answers).length;
  const hasClearAreas = answers.timeConsumingAreas.length > 1 ? 6 : 0;
  const repetitivePenalty =
    typeof answers.repetitiveHoursPerWeek === "number" &&
    answers.repetitiveHoursPerWeek > 24
      ? -5
      : 0;

  return Math.round(clamp(base + tools * 2 + hasClearAreas + repetitivePenalty, 0, 100));
}

function getTopAreas(opportunities: RecommendedOpportunity[]) {
  const areaScores = opportunities.reduce<Record<string, number>>((acc, opportunity) => {
    acc[opportunity.area] = (acc[opportunity.area] ?? 0) + opportunity.score;
    return acc;
  }, {});

  return Object.entries(areaScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area]) => area as BusinessArea);
}

function createBottlenecks(answers: DiagnosisAnswers, opportunities: RecommendedOpportunity[]) {
  const problems = getProblemList(answers);
  const defaults = [
    `tempo concentrado em ${formatAreas(answers.timeConsumingAreas)}`,
    "tarefas repetitivas ainda dependem de ação manual",
    `prioridade declarada: ${answers.priority || "definir prioridade operacional"}`,
  ];

  return [...problems, ...defaults]
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, Math.max(3, Math.min(6, opportunities.length)));
}

function createExecutiveSummary(
  answers: DiagnosisAnswers,
  opportunities: RecommendedOpportunity[],
  maturityScore: number,
) {
  const company = answers.companyName || "sua empresa";
  const topOpportunity = opportunities[0];
  const secondOpportunity = opportunities[1];
  const goal = answers.goal90Days ? goalLabels[answers.goal90Days] : "ganhar clareza";
  const segment = answers.segment || "negócio";

  return `${company} mostra maturidade de IA em ${maturityScore}/100 e tem maior potencial inicial em ${formatAreas(
    getTopAreas(opportunities),
  )}. Para os próximos 90 dias, o caminho mais pragmático é focar em ${goal}, começando por ${
    topOpportunity?.title.toLowerCase() ?? "um piloto simples"
  }${
    secondOpportunity ? ` e ${secondOpportunity.title.toLowerCase()}` : ""
  }. As estimativas abaixo são indicativas, baseadas nas respostas informadas para este ${segment.toLowerCase()}, e devem ser validadas com dados reais antes de uma decisão de investimento.`;
}

function createImplementationPlan(
  answers: DiagnosisAnswers,
  opportunities: RecommendedOpportunity[],
): ImplementationPlan {
  const first = opportunities[0];
  const second = opportunities[1];
  const third = opportunities[2];

  return {
    sevenDays: [
      "Escolher uma pessoa responsável pelo mapa e validar os gargalos com a equipe.",
      first
        ? `Rodar um piloto manual de ${first.title.toLowerCase()} usando dados reais e escopo pequeno.`
        : "Rodar um piloto manual com uma tarefa repetitiva de baixo risco.",
      "Definir política simples de uso de IA: dados permitidos, revisão humana e canais aprovados.",
      "Registrar linha de base: horas gastas, volume de demanda, erros e satisfação atual.",
    ],
    thirtyDays: [
      first
        ? `Transformar o piloto de ${first.title.toLowerCase()} em fluxo documentado.`
        : "Documentar o primeiro fluxo de automação.",
      second
        ? `Criar protótipo para ${second.title.toLowerCase()} e comparar esforço versus impacto.`
        : "Criar um segundo protótipo em outra área com alto volume manual.",
      "Treinar a equipe em prompts, revisão de respostas e critérios de escalonamento.",
      "Conectar planilha, CRM, agenda ou base de conhecimento quando fizer sentido.",
    ],
    ninetyDays: [
      "Consolidar indicadores e decidir quais automações viram rotina oficial.",
      third
        ? `Priorizar a expansão para ${third.title.toLowerCase()} se os dados do piloto confirmarem ganho.`
        : "Expandir o mapa para uma segunda frente de negócio.",
      "Criar governança: responsáveis, revisão mensal, backup dos fluxos e controle de acesso.",
      `Planejar a segunda onda de IA com foco em ${answers.priority || "impacto operacional mensurável"}.`,
    ],
  };
}

function createAssumptions(answers: DiagnosisAnswers) {
  const weeklyHours =
    typeof answers.repetitiveHoursPerWeek === "number"
      ? answers.repetitiveHoursPerWeek
      : 0;

  return [
    "As estimativas são projeções indicativas e não garantem resultado financeiro.",
    `O cálculo considera ${weeklyHours} horas semanais informadas em tarefas repetitivas.`,
    "Quanto melhor a qualidade dos dados, processos e revisão humana, maior a chance de capturar valor.",
    "Nenhum dado é enviado a serviços externos no MVP sem configuração explícita.",
  ];
}

export function personalizePrompt(prompt: string, answers: DiagnosisAnswers) {
  return prompt.replaceAll("{empresa}", answers.companyName || "minha empresa");
}

export function generateOpportunityMap(answers: DiagnosisAnswers): OpportunityMap {
  const opportunities = opportunityCatalog
    .map<RecommendedOpportunity>((template) => {
      const scored = scoreOpportunity(template, answers);

      return {
        ...template,
        score: scored.score,
        reasons: scored.reasons,
        priorityLevel: toPriorityLevel(scored.score),
        impactLevel: toImpactLevel(template.baseImpact),
        effortLevel: toEffortLevel(template.effort),
        estimatedHoursSavedMonthly: estimateMonthlyHours(template, scored.score, answers),
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (b.baseImpact !== a.baseImpact) {
        return b.baseImpact - a.baseImpact;
      }

      return a.effort - b.effort;
    });

  const selectedOpportunities = opportunities.slice(0, 8);
  const maturityScore = getMaturityScore(answers);
  const topAreas = getTopAreas(selectedOpportunities);
  const rawHours = selectedOpportunities.reduce(
    (total, opportunity) => total + opportunity.estimatedHoursSavedMonthly,
    0,
  );
  const weeklyHours =
    typeof answers.repetitiveHoursPerWeek === "number"
      ? answers.repetitiveHoursPerWeek
      : 0;
  const practicalCap = weeklyHours > 0 ? Math.round(weeklyHours * 4 * 0.9 + 32) : rawHours;
  const totalEstimatedHoursSavedMonthly = Math.min(rawHours, practicalCap);

  return {
    maturityScore,
    executiveSummary: createExecutiveSummary(answers, selectedOpportunities, maturityScore),
    bottlenecks: createBottlenecks(answers, selectedOpportunities),
    opportunities: selectedOpportunities,
    totalEstimatedHoursSavedMonthly,
    topAreas,
    implementationPlan: createImplementationPlan(answers, selectedOpportunities),
    generatedAt: new Date().toISOString(),
    assumptions: createAssumptions(answers),
  };
}
