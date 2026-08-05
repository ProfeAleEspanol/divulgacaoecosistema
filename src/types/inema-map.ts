export type BusinessArea =
  | "Atendimento"
  | "Marketing"
  | "Vendas"
  | "Operações"
  | "Gestão"
  | "Financeiro"
  | "Recursos Humanos"
  | "Conteúdo";

export type BusinessSegment =
  | "Clínica"
  | "Imobiliária"
  | "Escritório"
  | "Agência"
  | "Escola"
  | "Restaurante"
  | "Infoprodutor"
  | "Consultoria"
  | "Serviços"
  | "Varejo"
  | "Outro";

export type BusinessGoal =
  | "reduzir-custos"
  | "ganhar-tempo"
  | "vender-mais"
  | "melhorar-atendimento"
  | "organizar-gestao";

export type AiMaturity = "nenhuma" | "inicial" | "intermediaria" | "avancada";

export type ImpactLevel = "Baixo" | "Médio" | "Alto" | "Muito alto";

export type EffortLevel = "Baixo" | "Médio" | "Alto";

export type PriorityLevel = "Alta" | "Média" | "Exploratória";

export type LeadProfile = {
  name: string;
  email: string;
  companyRole?: string;
};

export type WorkspaceProfile = {
  workspaceName: string;
  ownerName: string;
  ownerEmail: string;
  authMode: "local" | "supabase-ready";
};

export type IntegrationSettings = {
  crmName: string;
  webhookUrl: string;
  whatsappNumber: string;
  notes: string;
};

export type DiagnosisAnswers = {
  companyName: string;
  segment: BusinessSegment | "";
  teamSize: number | "";
  timeConsumingAreas: BusinessArea[];
  currentProblems: string[];
  customProblems: string;
  goal90Days: BusinessGoal | "";
  toolsUsed: string[];
  customTools: string;
  aiMaturity: AiMaturity | "";
  repetitiveHoursPerWeek: number | "";
  priority: "reduzir custos" | "ganhar tempo" | "vender mais" | "melhorar atendimento" | "";
  lead?: LeadProfile;
};

export type OpportunityTemplate = {
  id: string;
  title: string;
  area: BusinessArea;
  problem: string;
  solution: string;
  agent: string;
  tools: string[];
  prompt: string;
  baseImpact: number;
  effort: number;
  urgency: number;
  baseHoursSavedMonthly: number;
  triggerKeywords: string[];
  relevantAreas: BusinessArea[];
  relevantSegments: BusinessSegment[];
  relevantGoals: BusinessGoal[];
  relevantPriorities: Array<DiagnosisAnswers["priority"]>;
  implementationSteps: string[];
  risks: string[];
  metrics: string[];
  nextAction: string;
};

export type RecommendedOpportunity = OpportunityTemplate & {
  score: number;
  priorityLevel: PriorityLevel;
  impactLevel: ImpactLevel;
  effortLevel: EffortLevel;
  estimatedHoursSavedMonthly: number;
  reasons: string[];
};

export type ImplementationPlan = {
  sevenDays: string[];
  thirtyDays: string[];
  ninetyDays: string[];
};

export type AiBrief = {
  source: "rules" | "openai";
  firstAction: string;
  suggestedNextActions: string[];
  riskNotes: string[];
};

export type OpportunityMap = {
  maturityScore: number;
  executiveSummary: string;
  bottlenecks: string[];
  opportunities: RecommendedOpportunity[];
  totalEstimatedHoursSavedMonthly: number;
  topAreas: BusinessArea[];
  implementationPlan: ImplementationPlan;
  generatedAt: string;
  assumptions: string[];
  aiBrief?: AiBrief;
};

export type MapHistoryItem = {
  id: string;
  companyName: string;
  segment: string;
  createdAt: string;
  maturityScore: number;
  totalEstimatedHoursSavedMonthly: number;
  topOpportunityTitles: string[];
  answers: DiagnosisAnswers;
  report: OpportunityMap;
};
