"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { businessAreas, businessSegments, opportunityCatalog } from "@/data/opportunities";
import { clinicDemoDiagnosis, emptyDiagnosis } from "@/data/demo-diagnosis";
import { trackEvent } from "@/lib/analytics";
import {
  clearInemaMapStorage,
  deleteMapHistoryItem,
  loadCustomCatalog,
  loadDiagnosisDraft,
  loadIntegrationSettings,
  loadLeadProfile,
  loadMapHistory,
  loadSavedReport,
  loadWorkspaceProfile,
  saveCustomCatalog,
  saveDiagnosisDraft,
  saveIntegrationSettings,
  saveLeadProfile,
  saveMapHistoryItem,
  saveReport,
  saveWorkspaceProfile,
} from "@/lib/local-diagnostic-store";
import {
  generateOpportunityMap,
  getProblemList,
  personalizePrompt,
} from "@/lib/recommendation-engine";
import type {
  AiMaturity,
  BusinessArea,
  BusinessGoal,
  DiagnosisAnswers,
  IntegrationSettings,
  LeadProfile,
  MapHistoryItem,
  OpportunityMap,
  OpportunityTemplate,
  RecommendedOpportunity,
  WorkspaceProfile,
} from "@/types/inema-map";

type ViewState = "home" | "diagnostic" | "processing" | "results" | "history" | "admin";

type FilterState = {
  area: BusinessArea | "Todas";
  impact: RecommendedOpportunity["impactLevel"] | "Todos";
  effort: RecommendedOpportunity["effortLevel"] | "Todos";
  priority: RecommendedOpportunity["priorityLevel"] | "Todas";
};

type InterestContext =
  | { type: "plan"; label: string }
  | { type: "opportunity"; label: string }
  | { type: "implementation"; label: string }
  | null;

type CatalogDraft = {
  title: string;
  area: BusinessArea;
  problem: string;
  solution: string;
  keywords: string;
};

const quickProblems = [
  "Atendimento demora para responder",
  "Tarefas administrativas repetitivas",
  "Baixa conversão comercial",
  "Dificuldade para produzir conteúdo",
  "Faltas em agendamentos",
  "Informações espalhadas",
  "Propostas demoram para sair",
  "Dificuldade em acompanhar métricas",
  "Cobranças e financeiro manuais",
  "Treinamento da equipe sem padrão",
];

const toolsOptions = [
  "WhatsApp Business",
  "Instagram",
  "Google Agenda",
  "Google Sheets",
  "Notion",
  "CRM",
  "ERP",
  "Canva",
  "ChatGPT",
  "Nenhuma ferramenta estruturada",
];

const goalOptions: Array<{ value: BusinessGoal; label: string; helper: string }> = [
  {
    value: "reduzir-custos",
    label: "Reduzir custos",
    helper: "Eliminar retrabalho, atrasos e tarefas operacionais manuais.",
  },
  {
    value: "ganhar-tempo",
    label: "Ganhar tempo",
    helper: "Liberar equipe para atividades de maior valor.",
  },
  {
    value: "vender-mais",
    label: "Vender mais",
    helper: "Melhorar follow-up, conversão e reativação.",
  },
  {
    value: "melhorar-atendimento",
    label: "Melhorar atendimento",
    helper: "Responder melhor, mais rápido e com consistência.",
  },
  {
    value: "organizar-gestao",
    label: "Organizar gestão",
    helper: "Criar visibilidade, indicadores e processos claros.",
  },
];

const maturityOptions: Array<{ value: AiMaturity; label: string; helper: string }> = [
  {
    value: "nenhuma",
    label: "Ainda não usamos",
    helper: "A empresa está começando agora.",
  },
  {
    value: "inicial",
    label: "Uso inicial",
    helper: "Algumas pessoas usam IA de forma pontual.",
  },
  {
    value: "intermediaria",
    label: "Uso intermediário",
    helper: "Já existem prompts, fluxos ou automações simples.",
  },
  {
    value: "avancada",
    label: "Uso avançado",
    helper: "Há processos, integrações ou agentes em produção.",
  },
];

const priorityOptions = [
  "reduzir custos",
  "ganhar tempo",
  "vender mais",
  "melhorar atendimento",
] as const;

const processingMessages = [
  "Analisando os gargalos",
  "Identificando tarefas repetitivas",
  "Calculando oportunidades",
  "Montando seu plano de implementação",
];

const pricingPlans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    description: "Diagnóstico inicial e visão resumida de oportunidades.",
    features: ["diagnóstico guiado", "pontuação de maturidade", "3 oportunidades principais"],
  },
  {
    name: "Pro",
    price: "Lista de espera",
    description: "Mapa completo, prompts e planos detalhados por oportunidade.",
    features: ["relatório completo", "biblioteca de prompts", "plano 7, 30 e 90 dias"],
  },
  {
    name: "Business",
    price: "Sob consulta",
    description: "Múltiplos projetos, equipe, governança e integrações.",
    features: ["times e projetos", "integrações futuras", "painel de evolução"],
  },
  {
    name: "Implementação",
    price: "Personalizado",
    description: "Apoio para transformar oportunidades priorizadas em soluções reais.",
    features: ["escopo assistido", "prototipação", "acompanhamento de execução"],
  },
];

const segmentExamples = [
  {
    segment: "Clínicas",
    result: "atendimento, confirmação de consultas e recuperação de pacientes inativos",
  },
  {
    segment: "Imobiliárias",
    result: "qualificação de leads, follow-up e geração de propostas",
  },
  {
    segment: "Agências",
    result: "briefings, conteúdo, propostas e gestão de entregas",
  },
  {
    segment: "Escolas",
    result: "atendimento, matrículas, conteúdo e comunicação com famílias",
  },
];

const faqItems = [
  {
    question: "O mapa substitui uma consultoria completa?",
    answer:
      "Não. O MVP entrega uma priorização prática baseada nas respostas. Ele ajuda a escolher bons primeiros pilotos e pode orientar uma consultoria posterior.",
  },
  {
    question: "As estimativas de horas são garantidas?",
    answer:
      "Não. Elas são projeções indicativas baseadas no volume de tarefas repetitivas informado, impacto do caso de uso e esforço de implementação.",
  },
  {
    question: "Preciso ter uma chave de IA para usar?",
    answer:
      "Não. A aplicação funciona com regras locais. Uma chave pode ser configurada futuramente para personalizar o resumo pelo servidor.",
  },
  {
    question: "Os dados são enviados para serviços externos?",
    answer:
      "Neste MVP, não há envio externo por padrão. Os dados ficam no navegador. Só haverá envio para IA se a rota server-side for configurada com chave.",
  },
];

function toggleListValue<T extends string>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function getStepError(step: number, answers: DiagnosisAnswers) {
  if (step === 0 && answers.companyName.trim().length < 2) {
    return "Informe o nome da empresa para personalizar o mapa.";
  }

  if (step === 1 && !answers.segment) {
    return "Selecione um segmento.";
  }

  if (
    step === 2 &&
    (answers.teamSize === "" || Number.isNaN(answers.teamSize) || answers.teamSize < 1)
  ) {
    return "Informe uma quantidade válida de pessoas.";
  }

  if (step === 3 && answers.timeConsumingAreas.length === 0) {
    return "Selecione pelo menos uma área que consome tempo.";
  }

  if (step === 4 && getProblemList(answers).length < 3) {
    return "Selecione ou escreva pelo menos três problemas atuais.";
  }

  if (step === 5 && !answers.goal90Days) {
    return "Escolha o objetivo principal para os próximos 90 dias.";
  }

  if (step === 6 && answers.toolsUsed.length === 0 && answers.customTools.trim().length < 2) {
    return "Informe ao menos uma ferramenta utilizada ou escreva outra opção.";
  }

  if (step === 7 && !answers.aiMaturity) {
    return "Selecione o nível de maturidade em IA.";
  }

  if (
    step === 8 &&
    (answers.repetitiveHoursPerWeek === "" ||
      Number.isNaN(answers.repetitiveHoursPerWeek) ||
      answers.repetitiveHoursPerWeek < 0 ||
      answers.repetitiveHoursPerWeek > 120)
  ) {
    return "Informe uma estimativa entre 0 e 120 horas semanais.";
  }

  if (step === 9 && !answers.priority) {
    return "Escolha uma prioridade para orientar a recomendação.";
  }

  return "";
}

function createHistoryItem(
  answers: DiagnosisAnswers,
  report: OpportunityMap,
): MapHistoryItem {
  return {
    id: `${report.generatedAt}-${answers.companyName || "empresa"}`,
    companyName: answers.companyName || "Empresa sem nome",
    segment: answers.segment || "Segmento não informado",
    createdAt: report.generatedAt,
    maturityScore: report.maturityScore,
    totalEstimatedHoursSavedMonthly: report.totalEstimatedHoursSavedMonthly,
    topOpportunityTitles: report.opportunities
      .slice(0, 3)
      .map((opportunity) => opportunity.title),
    answers,
    report,
  };
}

function createCustomOpportunity(
  draft: CatalogDraft,
  segments: readonly string[],
): OpportunityTemplate {
  const keywords = draft.keywords
    .split(/[,;\n]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return {
    id: `custom-${Date.now()}`,
    title: draft.title.trim(),
    area: draft.area,
    problem: draft.problem.trim(),
    solution: draft.solution.trim(),
    agent: `Agente customizado de ${draft.area}`,
    tools: ["ChatGPT", "Make", "Planilhas", "Base de conhecimento"],
    prompt:
      "Analise o problema informado, proponha um piloto enxuto, liste dados necessários, riscos e próximos passos para executar com revisão humana.",
    baseImpact: 4,
    effort: 3,
    urgency: 4,
    baseHoursSavedMonthly: 16,
    triggerKeywords: keywords.length > 0 ? keywords : [draft.area.toLowerCase()],
    relevantAreas: [draft.area],
    relevantSegments: segments.filter((segment) => segment !== "Outro") as OpportunityTemplate["relevantSegments"],
    relevantGoals: [
      "ganhar-tempo",
      "vender-mais",
      "melhorar-atendimento",
      "organizar-gestao",
    ],
    relevantPriorities: ["ganhar tempo", "vender mais", "melhorar atendimento"],
    implementationSteps: [
      "Definir escopo do piloto e dados mínimos necessários.",
      "Criar prompt ou fluxo inicial com revisão humana obrigatória.",
      "Testar com uma amostra pequena antes de automatizar.",
      "Medir horas poupadas, qualidade da saída e riscos percebidos.",
    ],
    risks: [
      "Caso de uso customizado precisa de validação antes de entrar em produção.",
      "Dados sensíveis devem ser removidos ou tratados com permissão adequada.",
    ],
    metrics: ["tempo economizado", "taxa de erro", "adoção pela equipe", "satisfação interna"],
    nextAction: "Transformar o caso customizado em um piloto de uma semana.",
  };
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function InemaAiMapApp() {
  const [view, setView] = useState<ViewState>("home");
  const [isHydrated, setIsHydrated] = useState(false);
  const [answers, setAnswers] = useState<DiagnosisAnswers>(emptyDiagnosis);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const [processingAnswers, setProcessingAnswers] = useState<DiagnosisAnswers | null>(null);
  const [report, setReport] = useState<OpportunityMap | null>(null);
  const [hasSavedReport, setHasSavedReport] = useState(false);
  const [reportHistory, setReportHistory] = useState<MapHistoryItem[]>([]);
  const [customCatalog, setCustomCatalog] = useState<OpportunityTemplate[]>([]);
  const [workspaceProfile, setWorkspaceProfile] = useState<WorkspaceProfile>({
    workspaceName: "INEMA.AI MAP",
    ownerName: "",
    ownerEmail: "",
    authMode: "local",
  });
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    crmName: "",
    webhookUrl: "",
    whatsappNumber: "",
    notes: "",
  });
  const [catalogDraft, setCatalogDraft] = useState<CatalogDraft>({
    title: "",
    area: "Operações",
    problem: "",
    solution: "",
    keywords: "",
  });
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<RecommendedOpportunity | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    area: "Todas",
    impact: "Todos",
    effort: "Todos",
    priority: "Todas",
  });
  const [interestContext, setInterestContext] = useState<InterestContext>(null);
  const [toast, setToast] = useState("");
  const [leadForm, setLeadForm] = useState<LeadProfile>({
    name: "",
    email: "",
    companyRole: "",
  });
  const [reportUnlocked, setReportUnlocked] = useState(false);

  useEffect(() => {
    const draft = loadDiagnosisDraft();
    const savedReport = loadSavedReport();
    const savedLead = loadLeadProfile();
    const savedHistory = loadMapHistory();

    if (draft) {
      setAnswers(draft);
    }

    if (savedReport) {
      setReport(savedReport);
      setHasSavedReport(true);
    }

    if (savedLead) {
      setLeadForm(savedLead);
      setReportUnlocked(true);
    }

    setReportHistory(savedHistory);
    setCustomCatalog(loadCustomCatalog());
    setWorkspaceProfile(loadWorkspaceProfile());
    setIntegrationSettings(loadIntegrationSettings());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      saveDiagnosisDraft(answers);
    }
  }, [answers, isHydrated]);

  const activeCatalog = useMemo(
    () => [...opportunityCatalog, ...customCatalog],
    [customCatalog],
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (view !== "processing" || !processingAnswers) {
      return;
    }

    setProcessingStep(0);

    const interval = window.setInterval(() => {
      setProcessingStep((step) => Math.min(step + 1, processingMessages.length - 1));
    }, 450);

    const timeout = window.setTimeout(() => {
      const generatedReport = generateOpportunityMap(processingAnswers, activeCatalog);
      const nextHistory = saveMapHistoryItem(
        createHistoryItem(processingAnswers, generatedReport),
      );
      setReport(generatedReport);
      saveReport(generatedReport);
      setReportHistory(nextHistory);
      setHasSavedReport(true);
      setView("results");
      setProcessingAnswers(null);
      setReportUnlocked(Boolean(processingAnswers.lead));
      trackEvent("diagnosis_completed", {
        segment: processingAnswers.segment || "não informado",
        opportunities: generatedReport.opportunities.length,
      });
      enhanceSummary(processingAnswers, generatedReport);
    }, 1900);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [activeCatalog, processingAnswers, view]);

  async function enhanceSummary(finalAnswers: DiagnosisAnswers, generatedReport: OpportunityMap) {
    try {
      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: finalAnswers,
          report: {
            executiveSummary: generatedReport.executiveSummary,
            opportunities: generatedReport.opportunities.slice(0, 5).map((opportunity) => ({
              title: opportunity.title,
              area: opportunity.area,
              score: opportunity.score,
            })),
            implementationPlan: generatedReport.implementationPlan,
          },
        }),
      });

      const data = (await response.json()) as {
        executiveSummary?: string | null;
        aiBrief?: OpportunityMap["aiBrief"] | null;
        source?: string;
      };

      if (
        data.aiBrief ||
        (data.executiveSummary && data.executiveSummary !== generatedReport.executiveSummary)
      ) {
        setReport((current) => {
          if (!current) {
            return current;
          }

          const enhanced = {
            ...current,
            executiveSummary: data.executiveSummary ?? current.executiveSummary,
            aiBrief: data.aiBrief ?? current.aiBrief,
          };
          saveReport(enhanced);
          return enhanced;
        });
      }
    } catch {
      // The local recommendation report is the product fallback.
    }
  }

  function startDiagnosis() {
    setView("diagnostic");
    setCurrentStep(0);
    setStepError("");
    trackEvent("diagnosis_started");
  }

  function loadDemo() {
    setAnswers(clinicDemoDiagnosis);
    setProcessingAnswers(clinicDemoDiagnosis);
    setView("processing");
    setStepError("");
    trackEvent("demo_loaded", { segment: "Clínica" });
  }

  function restoreReport() {
    if (report) {
      setView("results");
      trackEvent("saved_report_restored");
    }
  }

  function openHistoryItem(item: MapHistoryItem) {
    setAnswers(item.answers);
    setReport(item.report);
    setHasSavedReport(true);
    setView("results");
    trackEvent("history_report_opened", { segment: item.segment });
  }

  function removeHistoryItem(id: string) {
    const nextHistory = deleteMapHistoryItem(id);
    setReportHistory(nextHistory);
    setToast("Mapa removido do histórico local.");
  }

  function saveWorkspace(profile: WorkspaceProfile) {
    saveWorkspaceProfile(profile);
    setWorkspaceProfile(profile);
    setToast("Workspace salvo localmente.");
  }

  function saveIntegrations(settings: IntegrationSettings) {
    saveIntegrationSettings(settings);
    setIntegrationSettings(settings);
    setToast("Configurações de integração salvas localmente.");
  }

  function addCustomCatalogItem() {
    if (
      catalogDraft.title.trim().length < 3 ||
      catalogDraft.problem.trim().length < 8 ||
      catalogDraft.solution.trim().length < 8
    ) {
      setToast("Preencha título, problema e solução do caso customizado.");
      return;
    }

    const nextCatalog = [
      ...customCatalog,
      createCustomOpportunity(catalogDraft, businessSegments),
    ];
    saveCustomCatalog(nextCatalog);
    setCustomCatalog(nextCatalog);
    setCatalogDraft({
      title: "",
      area: "Operações",
      problem: "",
      solution: "",
      keywords: "",
    });
    setToast("Oportunidade customizada adicionada ao motor local.");
  }

  function removeCustomCatalogItem(id: string) {
    const nextCatalog = customCatalog.filter((item) => item.id !== id);
    saveCustomCatalog(nextCatalog);
    setCustomCatalog(nextCatalog);
    setToast("Oportunidade customizada removida.");
  }

  function resetDiagnosis() {
    clearInemaMapStorage();
    setAnswers(emptyDiagnosis);
    setReport(null);
    setHasSavedReport(false);
    setReportUnlocked(false);
    setLeadForm({ name: "", email: "", companyRole: "" });
    setSelectedOpportunity(null);
    setFilters({ area: "Todas", impact: "Todos", effort: "Todos", priority: "Todas" });
    setCurrentStep(0);
    setView("diagnostic");
    trackEvent("diagnosis_reset");
  }

  function updateAnswers(update: Partial<DiagnosisAnswers>) {
    setAnswers((current) => ({ ...current, ...update }));
    setStepError("");
  }

  function goNext() {
    const error = getStepError(currentStep, answers);

    if (error) {
      setStepError(error);
      return;
    }

    if (currentStep < 9) {
      setCurrentStep((step) => step + 1);
      return;
    }

    setProcessingAnswers(answers);
    setView("processing");
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
      setStepError("");
      return;
    }

    setView("home");
  }

  function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (leadForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadForm.email)) {
      setToast("Informe um e-mail válido ou continue sem informar.");
      return;
    }

    if (leadForm.name || leadForm.email) {
      saveLeadProfile(leadForm);
      trackEvent("lead_captured", { hasEmail: Boolean(leadForm.email) });
    }

    setReportUnlocked(true);
    setToast("Relatório completo liberado neste navegador.");
  }

  function skipLeadCapture() {
    setReportUnlocked(true);
    trackEvent("lead_capture_skipped");
  }

  async function copySummary() {
    if (!report) {
      return;
    }

    const text = `${report.executiveSummary}\n\nPrincipais oportunidades:\n${report.opportunities
      .slice(0, 3)
      .map((opportunity, index) => `${index + 1}. ${opportunity.title}`)
      .join("\n")}`;

    await navigator.clipboard?.writeText(text);
    setToast("Resumo copiado.");
    trackEvent("summary_copied");
  }

  async function shareReport() {
    if (!report) {
      return;
    }

    const text = `Meu Mapa INEMA.AI identificou ${report.opportunities.length} oportunidades e ${report.totalEstimatedHoursSavedMonthly} horas potenciais por mês.`;

    if (typeof navigator.share === "function") {
      await navigator.share({ title: "INEMA.AI MAP", text }).catch(() => undefined);
    } else {
      await navigator.clipboard?.writeText(text);
      setToast("Texto para compartilhamento copiado.");
    }

    trackEvent("report_shared");
  }

  function exportReportJson() {
    if (!report) {
      return;
    }

    downloadJson(`inema-ai-map-${answers.companyName || "relatorio"}.json`, {
      answers,
      report,
      exportedAt: new Date().toISOString(),
    });
    trackEvent("report_json_exported");
  }

  return (
    <div className="aurora-shell min-h-screen overflow-x-hidden text-white">
      <Header
        onStart={startDiagnosis}
        onDemo={loadDemo}
        onRestore={restoreReport}
        hasSavedReport={hasSavedReport}
        historyCount={reportHistory.length}
        onAdmin={() => setView("admin")}
        onHistory={() => setView("history")}
      />

      {view === "home" ? (
        <HomeView onStart={startDiagnosis} onDemo={loadDemo} onInterest={setInterestContext} />
      ) : null}

      {view === "diagnostic" ? (
        <DiagnosticView
          answers={answers}
          currentStep={currentStep}
          error={stepError}
          onBack={goBack}
          onNext={goNext}
          onUpdate={updateAnswers}
        />
      ) : null}

      {view === "processing" ? <ProcessingView step={processingStep} /> : null}

      {view === "history" ? (
        <HistoryView
          history={reportHistory}
          onBack={() => setView("home")}
          onOpen={openHistoryItem}
          onRemove={removeHistoryItem}
        />
      ) : null}

      {view === "admin" ? (
        <AdminView
          catalogDraft={catalogDraft}
          customCatalog={customCatalog}
          integrationSettings={integrationSettings}
          workspaceProfile={workspaceProfile}
          onAddCatalogItem={addCustomCatalogItem}
          onBack={() => setView("home")}
          onCatalogDraftChange={setCatalogDraft}
          onRemoveCatalogItem={removeCustomCatalogItem}
          onSaveIntegrations={saveIntegrations}
          onSaveWorkspace={saveWorkspace}
        />
      ) : null}

      {view === "results" && report ? (
        <DashboardView
          answers={answers}
          report={report}
          filters={filters}
          leadForm={leadForm}
          reportUnlocked={reportUnlocked}
          onFilterChange={setFilters}
          onLeadChange={setLeadForm}
          onLeadSubmit={submitLead}
          onLeadSkip={skipLeadCapture}
          onCopy={copySummary}
          onShare={shareReport}
          onExportJson={exportReportJson}
          onPrint={() => {
            trackEvent("report_printed");
            window.print();
          }}
          onRestart={resetDiagnosis}
          onSelectOpportunity={setSelectedOpportunity}
          onInterest={setInterestContext}
        />
      ) : null}

      <Footer />

      {selectedOpportunity && report ? (
        <OpportunityModal
          answers={answers}
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          onInterest={setInterestContext}
        />
      ) : null}

      {interestContext ? (
        <InterestModal
          context={interestContext}
          integrationSettings={integrationSettings}
          onClose={() => setInterestContext(null)}
        />
      ) : null}

      {toast ? (
        <div
          className="fixed bottom-5 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-lg border border-emerald-200/50 bg-emerald-300 px-4 py-3 text-center text-sm font-bold text-slate-950 shadow-[0_20px_70px_rgba(16,185,129,0.32)]"
          role="status"
          onAnimationEnd={() => setToast("")}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function Header({
  hasSavedReport,
  historyCount,
  onAdmin,
  onDemo,
  onHistory,
  onRestore,
  onStart,
}: {
  hasSavedReport: boolean;
  historyCount: number;
  onAdmin: () => void;
  onDemo: () => void;
  onHistory: () => void;
  onRestore: () => void;
  onStart: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="inema-header sticky top-0 z-40 print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3 sm:px-6 lg:px-8">
        <a
          href="#topo"
          className="group inline-flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none"
          aria-label="INEMA.AI MAP"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan-200/35 bg-cyan-300/10 text-sm font-black text-cyan-100 shadow-[0_0_34px_rgba(34,211,238,0.22)]">
            IA
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-black tracking-[0.2em] text-white sm:text-base">
              INEMA.AI MAP
            </span>
            <span className="brand-pill mt-1 hidden rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] sm:inline-flex">
              Opportunity intelligence
            </span>
          </span>
        </a>

        <nav className="inema-header-nav hidden items-center gap-6 text-sm font-semibold text-slate-300 md:flex">
          <a href="#como-funciona" className="quiet-link transition" onClick={closeMobileMenu}>
            Como funciona
          </a>
          <button type="button" onClick={() => { closeMobileMenu(); onHistory(); }} className="quiet-link transition">
            Histórico{historyCount > 0 ? ` (${historyCount})` : ""}
          </button>
          <button type="button" onClick={() => { closeMobileMenu(); onAdmin(); }} className="quiet-link transition">
            Admin
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {hasSavedReport ? (
            <button
              type="button"
              onClick={onRestore}
              className="secondary-action hidden rounded-lg px-3 py-2 text-sm font-bold transition sm:inline-flex"
            >
              Retomar mapa
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDemo}
            className="secondary-action hidden rounded-lg px-3 py-2 text-sm font-bold transition sm:inline-flex"
          >
            Ver demonstração
          </button>
          <button
            type="button"
            onClick={() => { closeMobileMenu(); onStart(); }}
            className="primary-action rounded-lg px-4 py-2 text-sm font-black transition"
          >
            Criar meu mapa
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="secondary-action grid h-10 w-10 place-items-center rounded-lg text-lg font-black md:hidden"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>
      {mobileMenuOpen ? (
        <nav className="mobile-nav border-t border-white/10 px-5 py-3 md:hidden" aria-label="Menu principal">
          <a href="#como-funciona" onClick={closeMobileMenu} className="mobile-nav-link">
            Como funciona
          </a>
          <button type="button" onClick={() => { closeMobileMenu(); onHistory(); }} className="mobile-nav-link">
            Histórico{historyCount > 0 ? ` (${historyCount})` : ""}
          </button>
          <button type="button" onClick={() => { closeMobileMenu(); onAdmin(); }} className="mobile-nav-link">
            Admin
          </button>
          <button type="button" onClick={() => { closeMobileMenu(); onDemo(); }} className="mobile-nav-link">
            Ver demonstração
          </button>
        </nav>
      ) : null}
    </header>
  );
}

function HomeView({
  onDemo,
  onInterest,
  onStart,
}: {
  onDemo: () => void;
  onInterest: (context: InterestContext) => void;
  onStart: () => void;
}) {
  return (
    <main id="topo" className="inema-home">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(124,77,255,0.22),transparent_31%),linear-gradient(135deg,rgba(3,7,18,0.28)_0%,rgba(7,19,40,0.75)_48%,rgba(4,17,18,0.72)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div>
            <p className="brand-pill mb-5 inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
              Mapeie as oportunidades da sua empresa
            </p>
            <h1 className="max-w-4xl text-balance text-4xl font-black tracking-normal text-white sm:text-5xl lg:text-6xl">
              Descubra onde a Inteligência Artificial pode fazer sua empresa crescer.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Em poucos minutos, transforme desafios do negócio em um mapa prático de
              automações, agentes, prompts e prioridades de implementação.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onStart}
                className="primary-action rounded-lg px-6 py-4 text-base font-black transition"
              >
                Criar meu mapa gratuitamente
              </button>
              <button
                type="button"
                onClick={onDemo}
                className="secondary-action rounded-lg px-6 py-4 text-base font-black transition"
              >
                Ver uma demonstração
              </button>
            </div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["13+", "oportunidades no catálogo"],
                ["10", "perguntas guiadas"],
                ["7/30/90", "plano por ondas"],
              ].map(([value, label]) => (
                <div key={value} className="glass-card rounded-lg p-4">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400">
              As estimativas são indicativas e dependem das respostas fornecidas,
              qualidade dos dados e execução dos pilotos.
            </p>
          </div>

          <MapPreview />
        </div>
      </section>

      <section id="como-funciona" className="border-y border-white/10 bg-[#07101f] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Como funciona"
            title="Diagnóstico curto, mapa claro e plano de execução."
            description="A experiência foi desenhada para empresários que precisam decidir onde a IA entra primeiro, sem depender de promessas vagas."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["1", "Responda o diagnóstico", "Uma pergunta por vez, com opções rápidas e campo aberto quando necessário."],
              ["2", "Receba oportunidades priorizadas", "O motor local cruza gargalos, objetivo, segmento, impacto, esforço e horas repetitivas."],
              ["3", "Implemente por ondas", "O dashboard entrega próximos passos para 7, 30 e 90 dias."],
            ].map(([step, title, text]) => (
              <article
                key={step}
                className="glass-card focus-ring rounded-lg p-6"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-cyan-200 to-emerald-300 text-sm font-black text-slate-950 shadow-[0_12px_34px_rgba(34,211,238,0.18)]">
                  {step}
                </span>
                <h3 className="mt-5 text-xl font-black text-white">{title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#030711]/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Exemplos por segmento"
            title="Resultados práticos para negócios diferentes."
            description="O catálogo foi separado da interface para permitir novos segmentos sem reescrever a aplicação."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {segmentExamples.map((item) => (
              <article
                key={item.segment}
                className="glass-card focus-ring rounded-lg p-6"
              >
                <h3 className="text-lg font-black text-white">{item.segment}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">{item.result}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#08111f] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <SectionHeading
            eyebrow="Benefícios"
            title="Um mapa para transformar curiosidade em execução."
            description="A proposta é sair da lista de ferramentas e chegar a casos de uso priorizados, com responsáveis, prompts e indicadores."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "clareza sobre os gargalos que mais consomem tempo",
              "priorização por impacto, esforço e urgência",
              "prompts iniciais para testar sem travar",
              "filtros por área, esforço, impacto e prioridade",
              "plano de 7, 30 e 90 dias",
              "relatório imprimível ou salvável em PDF pelo navegador",
            ].map((benefit) => (
              <div
                key={benefit}
                className="rounded-lg border border-emerald-200/20 bg-emerald-300/[0.075] p-5 text-sm font-bold leading-6 text-emerald-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#030711]/70 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Demonstração comercial"
            title="Depoimentos fictícios para layout."
            description="Os textos abaixo são placeholders claramente identificados e devem ser substituídos por clientes reais quando houver autorização."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Placeholder", "A visualização deixou claro por onde começar sem tentar automatizar tudo ao mesmo tempo."],
              ["Placeholder", "O plano de 30 dias ajudou a organizar um piloto de atendimento com baixo risco."],
              ["Placeholder", "A lista de prompts reduziu a distância entre ideia e teste prático com a equipe."],
            ].map(([name, quote]) => (
              <blockquote
                key={quote}
                className="glass-card rounded-lg p-6"
              >
                <p className="text-sm font-black uppercase tracking-[0.16em] text-violet-200">
                  {name}
                </p>
                <p className="mt-4 leading-7 text-slate-300">{quote}</p>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <PricingSection onInterest={onInterest} />
      <PlansHomeSection />

      <section id="faq" className="bg-[#07101f] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Perguntas frequentes"
            title="Antes de começar o diagnóstico."
            description="Respostas objetivas para posicionar expectativa, dados e limitações."
          />
          <div className="mt-10 grid gap-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group glass-card rounded-lg p-5"
              >
                <summary className="cursor-pointer list-none text-lg font-black text-white">
                  <span className="flex items-start justify-between gap-4">
                    {item.question}
                    <span className="text-cyan-200 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-4 leading-7 text-slate-300">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,#0b1530,#102016)] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-black text-white sm:text-5xl">
            Descobrir oportunidades com IA
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Crie agora um mapa personalizado e veja quais agentes, automações e
            prompts fazem mais sentido para o seu negócio.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="primary-action mt-8 rounded-lg px-6 py-4 text-base font-black transition"
          >
            Criar meu mapa
          </button>
        </div>
      </section>
    </main>
  );
}

function PricingSection({
  onInterest,
}: {
  onInterest: (context: InterestContext) => void;
}) {
  return (
    <section id="planos" className="bg-[#08111f] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Planos comerciais"
          title="Estrutura preparada para monetização."
          description="Pagamentos não estão ativos nesta versão. Os botões registram interesse e simulam lista de espera."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <article
              key={plan.name}
              className="glass-card focus-ring flex min-h-[320px] flex-col rounded-lg p-6"
            >
              <h3 className="text-xl font-black text-white">{plan.name}</h3>
              <p className="mt-3 text-2xl font-black text-emerald-200">{plan.price}</p>
              <p className="mt-4 text-sm leading-6 text-slate-300">{plan.description}</p>
              <ul className="mt-6 grid gap-2 text-sm text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onInterest({ type: "plan", label: plan.name })}
                className="secondary-action mt-auto rounded-lg px-4 py-3 text-sm font-black transition"
              >
                Tenho interesse
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlansHomeSection() {
  return (
    <section className="bg-transparent py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="glass-card rounded-lg p-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
            Ecossistema INEMA
          </p>
          <p className="mt-3 max-w-4xl leading-7 text-slate-300">
            Espaço preparado para indicar produtos, aulas, comunidades e programas do
            ecossistema INEMA conforme o segmento e as oportunidades identificadas.
          </p>
        </div>
      </div>
    </section>
  );
}

function MapPreview() {
  const rows = [
    ["Atendimento lento", "Agente de atendimento", "Triagem + FAQ", "Alto", "Piloto em 7 dias"],
    ["Faltas na agenda", "Lembretes automáticos", "WhatsApp + agenda", "Muito alto", "Fluxo de confirmação"],
    ["Leads sem retorno", "Follow-up comercial", "CRM + IA", "Alto", "Roteiro de vendas"],
  ];

  return (
    <div className="relative lg:pl-4">
      <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-cyan-300/18 via-violet-400/20 to-emerald-300/14 blur-2xl" />
      <div className="glass-panel relative overflow-hidden rounded-xl p-4 sm:p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent" />
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
              Mapa visual
            </p>
            <h2 className="mt-2 text-xl font-black text-white">Problema - Oportunidade - Ação</h2>
          </div>
          <div className="rounded-lg bg-emerald-300 px-3 py-2 text-xs font-black text-slate-950">
            12+ casos
          </div>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          {["Impacto", "Esforço", "Próxima onda"].map((label, index) => (
            <div key={label} className="rounded-lg border border-white/10 bg-slate-950/45 px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                {label}
              </p>
              <p className="mt-1 text-sm font-black text-white">
                {index === 0 ? "Alto" : index === 1 ? "Baixo-médio" : "7 dias"}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <div className="hidden grid-cols-5 gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 sm:grid">
            <span>Problema</span>
            <span>Oportunidade</span>
            <span>Solução de IA</span>
            <span>Impacto</span>
            <span>Próxima ação</span>
          </div>
          {rows.map((row) => (
            <div
              key={row.join("-")}
              className="map-lane grid gap-2 rounded-lg border border-white/10 bg-slate-950/50 p-3 sm:grid-cols-5"
            >
              {row.map((item, index) => (
                <div
                  key={item}
                  className={`relative z-10 rounded-md px-3 py-2 text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] ${
                    index === 3
                      ? "bg-emerald-300/15 text-emerald-100"
                      : index === 4
                        ? "bg-cyan-300/12 text-cyan-100"
                        : "bg-white/[0.045] text-slate-200"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="relative">
      <div className="mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-cyan-200 via-violet-300 to-emerald-300" />
      <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">{eyebrow}</p>
      <h2 className="mt-4 max-w-3xl text-balance text-3xl font-black text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{description}</p>
    </div>
  );
}

function DiagnosticView({
  answers,
  currentStep,
  error,
  onBack,
  onNext,
  onUpdate,
}: {
  answers: DiagnosisAnswers;
  currentStep: number;
  error: string;
  onBack: () => void;
  onNext: () => void;
  onUpdate: (update: Partial<DiagnosisAnswers>) => void;
}) {
  const progress = ((currentStep + 1) / 10) * 100;

  return (
    <main id="diagnostico" className="min-h-[calc(100vh-74px)] bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(124,77,255,0.14),transparent_28%)] py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
        <div className="mb-6 glass-card rounded-lg p-4">
          <div className="flex items-center justify-between gap-4 text-sm font-bold text-slate-300">
            <span>Diagnóstico interativo</span>
            <span>{currentStep + 1} de 10</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10 ring-1 ring-white/10" aria-hidden="true">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-emerald-300 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <section className="glass-panel rounded-xl p-5 sm:p-8">
          {renderDiagnosticStep(currentStep, answers, onUpdate)}

          {error ? (
            <p className="mt-5 rounded-lg border border-rose-300/35 bg-rose-300/10 px-4 py-3 text-sm font-bold text-rose-100" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onBack}
              className="secondary-action rounded-lg px-5 py-3 text-sm font-black transition"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={onNext}
              className="primary-action rounded-lg px-5 py-3 text-sm font-black transition"
            >
              {currentStep === 9 ? "Gerar meu mapa" : "Continuar"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function renderDiagnosticStep(
  step: number,
  answers: DiagnosisAnswers,
  onUpdate: (update: Partial<DiagnosisAnswers>) => void,
) {
  if (step === 0) {
    return (
      <QuestionShell
        title="Qual é o nome da empresa?"
        description="Usaremos esse nome para personalizar prompts, resumo e plano."
      >
        <label className="grid gap-2 text-sm font-bold text-slate-200">
          Nome da empresa
          <input
            value={answers.companyName}
            onChange={(event) => onUpdate({ companyName: event.target.value })}
            className="rounded-lg border border-white/12 bg-slate-950/70 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
            placeholder="Ex.: Clínica Aurora"
            autoFocus
          />
        </label>
      </QuestionShell>
    );
  }

  if (step === 1) {
    return (
      <QuestionShell
        title="Qual é o segmento?"
        description="Isso ajusta exemplos, prioridade e hipóteses de automação."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {businessSegments.map((segment) => (
            <OptionButton
              key={segment}
              selected={answers.segment === segment}
              onClick={() => onUpdate({ segment })}
            >
              {segment}
            </OptionButton>
          ))}
        </div>
      </QuestionShell>
    );
  }

  if (step === 2) {
    return (
      <QuestionShell
        title="Quantas pessoas trabalham no negócio?"
        description="Inclua sócios, equipe fixa e pessoas que participam da operação."
      >
        <label className="grid gap-2 text-sm font-bold text-slate-200">
          Quantidade de pessoas
          <input
            min={1}
            value={answers.teamSize}
            onChange={(event) =>
              onUpdate({
                teamSize: event.target.value === "" ? "" : Number(event.target.value),
              })
            }
            className="rounded-lg border border-white/12 bg-slate-950/70 px-4 py-3 text-base text-white outline-none transition focus:border-cyan-300"
            inputMode="numeric"
            type="number"
          />
        </label>
      </QuestionShell>
    );
  }

  if (step === 3) {
    return (
      <QuestionShell
        title="Quais áreas consomem mais tempo?"
        description="Selecione todas que concentram tarefas manuais, dúvidas ou retrabalho."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {businessAreas.map((area) => (
            <OptionButton
              key={area}
              selected={answers.timeConsumingAreas.includes(area)}
              onClick={() =>
                onUpdate({
                  timeConsumingAreas: toggleListValue(answers.timeConsumingAreas, area),
                })
              }
            >
              {area}
            </OptionButton>
          ))}
        </div>
      </QuestionShell>
    );
  }

  if (step === 4) {
    return (
      <QuestionShell
        title="Quais são os três maiores problemas atuais?"
        description="Escolha opções rápidas e complemente com problemas específicos do seu contexto."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {quickProblems.map((problem) => (
            <OptionButton
              key={problem}
              selected={answers.currentProblems.includes(problem)}
              onClick={() =>
                onUpdate({
                  currentProblems: toggleListValue(answers.currentProblems, problem),
                })
              }
            >
              {problem}
            </OptionButton>
          ))}
        </div>
        <label className="mt-5 grid gap-2 text-sm font-bold text-slate-200">
          Outros problemas
          <textarea
            value={answers.customProblems}
            onChange={(event) => onUpdate({ customProblems: event.target.value })}
            className="min-h-28 rounded-lg border border-white/12 bg-slate-950/70 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
            placeholder="Escreva um por linha, se quiser."
          />
        </label>
      </QuestionShell>
    );
  }

  if (step === 5) {
    return (
      <QuestionShell
        title="Qual é o principal objetivo para os próximos 90 dias?"
        description="O objetivo pesa na priorização das oportunidades."
      >
        <div className="grid gap-3">
          {goalOptions.map((goal) => (
            <OptionButton
              key={goal.value}
              selected={answers.goal90Days === goal.value}
              onClick={() => onUpdate({ goal90Days: goal.value })}
            >
              <span className="block text-base">{goal.label}</span>
              <span className="mt-1 block text-sm font-medium text-slate-400">{goal.helper}</span>
            </OptionButton>
          ))}
        </div>
      </QuestionShell>
    );
  }

  if (step === 6) {
    return (
      <QuestionShell
        title="Quais ferramentas a empresa já utiliza?"
        description="Isso ajuda a sugerir caminhos compatíveis com a operação atual."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {toolsOptions.map((tool) => (
            <OptionButton
              key={tool}
              selected={answers.toolsUsed.includes(tool)}
              onClick={() =>
                onUpdate({ toolsUsed: toggleListValue(answers.toolsUsed, tool) })
              }
            >
              {tool}
            </OptionButton>
          ))}
        </div>
        <label className="mt-5 grid gap-2 text-sm font-bold text-slate-200">
          Outras ferramentas
          <input
            value={answers.customTools}
            onChange={(event) => onUpdate({ customTools: event.target.value })}
            className="rounded-lg border border-white/12 bg-slate-950/70 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
            placeholder="Ex.: sistema próprio, ERP, agenda interna"
          />
        </label>
      </QuestionShell>
    );
  }

  if (step === 7) {
    return (
      <QuestionShell
        title="Qual é o nível de maturidade em IA?"
        description="Não há resposta certa. A pontuação serve para orientar o ponto de partida."
      >
        <div className="grid gap-3">
          {maturityOptions.map((option) => (
            <OptionButton
              key={option.value}
              selected={answers.aiMaturity === option.value}
              onClick={() => onUpdate({ aiMaturity: option.value })}
            >
              <span className="block text-base">{option.label}</span>
              <span className="mt-1 block text-sm font-medium text-slate-400">
                {option.helper}
              </span>
            </OptionButton>
          ))}
        </div>
      </QuestionShell>
    );
  }

  if (step === 8) {
    return (
      <QuestionShell
        title="Quantas horas semanais são gastas em tarefas repetitivas?"
        description="Use uma estimativa. Ela influencia a projeção indicativa de economia de tempo."
      >
        <label className="grid gap-2 text-sm font-bold text-slate-200">
          Horas por semana
          <input
            min={0}
            max={120}
            value={answers.repetitiveHoursPerWeek}
            onChange={(event) =>
              onUpdate({
                repetitiveHoursPerWeek:
                  event.target.value === "" ? "" : Number(event.target.value),
              })
            }
            className="rounded-lg border border-white/12 bg-slate-950/70 px-4 py-3 text-base text-white outline-none transition focus:border-cyan-300"
            inputMode="numeric"
            type="number"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          {[5, 10, 20, 30, 40].map((hours) => (
            <button
              key={hours}
              type="button"
              onClick={() => onUpdate({ repetitiveHoursPerWeek: hours })}
              className="rounded-lg border border-white/12 px-3 py-2 text-sm font-bold text-slate-200 transition hover:border-cyan-300/60"
            >
              {hours}h
            </button>
          ))}
        </div>
      </QuestionShell>
    );
  }

  return (
    <QuestionShell
      title="Qual é a prioridade?"
      description="Escolha o critério que deve puxar a primeira onda do mapa."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {priorityOptions.map((priority) => (
          <OptionButton
            key={priority}
            selected={answers.priority === priority}
            onClick={() => onUpdate({ priority })}
          >
            {priority}
          </OptionButton>
        ))}
      </div>
    </QuestionShell>
  );
}

function QuestionShell({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div>
      <h1 className="text-balance text-3xl font-black text-white sm:text-4xl">{title}</h1>
      <p className="mt-4 text-lg leading-8 text-slate-300">{description}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function OptionButton({
  children,
  onClick,
  selected,
}: {
  children: React.ReactNode;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring min-h-14 rounded-lg border px-4 py-3 text-left text-sm font-bold transition ${
        selected
          ? "border-emerald-200/70 bg-emerald-300/16 text-emerald-50 shadow-[0_0_0_1px_rgba(86,246,176,0.28),0_18px_50px_rgba(16,185,129,0.12)]"
          : "border-white/12 bg-slate-950/58 text-slate-200 hover:border-cyan-200/60 hover:bg-cyan-300/10"
      }`}
      aria-pressed={selected}
    >
      {children}
    </button>
  );
}

function ProcessingView({ step }: { step: number }) {
  return (
    <main className="grid min-h-[calc(100vh-74px)] place-items-center bg-[radial-gradient(circle_at_50%_0%,rgba(124,77,255,0.18),transparent_30%),#030711] px-5 py-16">
      <section className="glass-panel w-full max-w-2xl rounded-xl p-8 text-center">
        <div className="signal-pulse mx-auto grid h-20 w-20 place-items-center rounded-full border border-cyan-200/35 bg-cyan-300/10 shadow-[0_0_70px_rgba(34,211,238,0.22)]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-200 border-t-transparent" />
        </div>
        <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-cyan-200">
          Gerando mapa
        </p>
        <h1 className="mt-4 text-balance text-3xl font-black text-white sm:text-4xl" aria-live="polite">
          {processingMessages[step]}
        </h1>
        <div className="mt-8 grid gap-3 text-left">
          {processingMessages.map((message, index) => (
            <div
              key={message}
              className={`rounded-lg border px-4 py-3 text-sm font-bold transition ${
                index <= step
                  ? "border-emerald-200/35 bg-emerald-300/12 text-emerald-50"
                  : "border-white/10 bg-white/[0.035] text-slate-500"
              }`}
            >
              {message}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function HistoryView({
  history,
  onBack,
  onOpen,
  onRemove,
}: {
  history: MapHistoryItem[];
  onBack: () => void;
  onOpen: (item: MapHistoryItem) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <main className="min-h-[calc(100vh-74px)] bg-transparent py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Histórico local"
            title="Mapas gerados neste navegador"
            description="Use esta área para comparar diagnósticos, retomar uma empresa ou exportar o histórico antes de integrar Supabase."
          />
          <button
            type="button"
            onClick={onBack}
            className="secondary-action rounded-lg px-4 py-3 text-sm font-black transition"
          >
            Voltar
          </button>
        </div>

        {history.length === 0 ? (
          <div className="glass-card mt-10 rounded-xl p-8 text-slate-300">
            Nenhum mapa salvo ainda. Conclua um diagnóstico ou carregue a demonstração de clínica.
          </div>
        ) : (
          <div className="mt-10 grid gap-4">
            {history.map((item) => (
              <article
                key={item.id}
                className="glass-card rounded-xl p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.14em] text-cyan-200">
                      {new Date(item.createdAt).toLocaleString("pt-BR")}
                    </p>
                    <h2 className="mt-3 text-2xl font-black text-white">
                      {item.companyName}
                    </h2>
                    <p className="mt-2 text-sm font-bold text-slate-400">
                      {item.segment} · maturidade {item.maturityScore}/100 ·{" "}
                      {item.totalEstimatedHoursSavedMonthly}h/mês indicativas
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => onOpen(item)}
                      className="primary-action rounded-lg px-4 py-3 text-sm font-black transition"
                    >
                      Abrir mapa
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadJson(`historico-${item.companyName}.json`, item)}
                      className="secondary-action rounded-lg px-4 py-3 text-sm font-black transition"
                    >
                      Exportar
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="rounded-lg border border-rose-300/30 px-4 py-3 text-sm font-black text-rose-100 transition hover:bg-rose-300 hover:text-slate-950"
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.topOpportunityTitles.map((title) => (
                    <span
                      key={title}
                      className="rounded-lg border border-white/10 bg-slate-950/45 px-3 py-2 text-xs font-bold text-slate-200"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function AdminView({
  catalogDraft,
  customCatalog,
  integrationSettings,
  onAddCatalogItem,
  onBack,
  onCatalogDraftChange,
  onRemoveCatalogItem,
  onSaveIntegrations,
  onSaveWorkspace,
  workspaceProfile,
}: {
  catalogDraft: CatalogDraft;
  customCatalog: OpportunityTemplate[];
  integrationSettings: IntegrationSettings;
  onAddCatalogItem: () => void;
  onBack: () => void;
  onCatalogDraftChange: (draft: CatalogDraft) => void;
  onRemoveCatalogItem: (id: string) => void;
  onSaveIntegrations: (settings: IntegrationSettings) => void;
  onSaveWorkspace: (profile: WorkspaceProfile) => void;
  workspaceProfile: WorkspaceProfile;
}) {
  const [workspaceDraft, setWorkspaceDraft] = useState(workspaceProfile);
  const [integrationDraft, setIntegrationDraft] = useState(integrationSettings);

  useEffect(() => setWorkspaceDraft(workspaceProfile), [workspaceProfile]);
  useEffect(() => setIntegrationDraft(integrationSettings), [integrationSettings]);

  return (
    <main className="min-h-[calc(100vh-74px)] bg-transparent py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Admin local"
            title="Configurações para evoluir para SaaS"
            description="Esta área prepara autenticação, histórico, integrações e catálogo sem exigir Supabase, CRM ou webhook nesta versão."
          />
          <button
            type="button"
            onClick={onBack}
            className="secondary-action rounded-lg px-4 py-3 text-sm font-black transition"
          >
            Voltar
          </button>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="glass-card rounded-xl p-5">
            <h2 className="text-2xl font-black text-white">Workspace e auth</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Dados salvos localmente. Quando houver Supabase, esta estrutura vira perfil
              de workspace e usuário.
            </p>
            <div className="mt-5 grid gap-4">
              <AdminInput
                label="Nome do workspace"
                value={workspaceDraft.workspaceName}
                onChange={(value) =>
                  setWorkspaceDraft({ ...workspaceDraft, workspaceName: value })
                }
              />
              <AdminInput
                label="Responsável"
                value={workspaceDraft.ownerName}
                onChange={(value) => setWorkspaceDraft({ ...workspaceDraft, ownerName: value })}
              />
              <AdminInput
                label="E-mail do responsável"
                value={workspaceDraft.ownerEmail}
                onChange={(value) =>
                  setWorkspaceDraft({ ...workspaceDraft, ownerEmail: value })
                }
              />
              <label className="grid gap-2 text-sm font-bold text-slate-200">
                Modo
                <select
                  value={workspaceDraft.authMode}
                  onChange={(event) =>
                    setWorkspaceDraft({
                      ...workspaceDraft,
                      authMode: event.target.value as WorkspaceProfile["authMode"],
                    })
                  }
                  className="rounded-lg border border-white/12 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="local">Local</option>
                  <option value="supabase-ready">Preparado para Supabase</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => onSaveWorkspace(workspaceDraft)}
                className="primary-action rounded-lg px-4 py-3 text-sm font-black transition"
              >
                Salvar workspace
              </button>
            </div>
          </section>

          <section className="glass-card rounded-xl p-5">
            <h2 className="text-2xl font-black text-white">Integrações</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              O MVP não envia dados externos sem configuração. Estes campos preparam
              CRM, WhatsApp e webhook para a próxima etapa.
            </p>
            <div className="mt-5 grid gap-4">
              <AdminInput
                label="CRM principal"
                value={integrationDraft.crmName}
                onChange={(value) =>
                  setIntegrationDraft({ ...integrationDraft, crmName: value })
                }
              />
              <AdminInput
                label="Webhook de implementação"
                value={integrationDraft.webhookUrl}
                onChange={(value) =>
                  setIntegrationDraft({ ...integrationDraft, webhookUrl: value })
                }
              />
              <AdminInput
                label="WhatsApp comercial"
                value={integrationDraft.whatsappNumber}
                onChange={(value) =>
                  setIntegrationDraft({ ...integrationDraft, whatsappNumber: value })
                }
              />
              <label className="grid gap-2 text-sm font-bold text-slate-200">
                Observações
                <textarea
                  value={integrationDraft.notes}
                  onChange={(event) =>
                    setIntegrationDraft({ ...integrationDraft, notes: event.target.value })
                  }
                  className="min-h-24 rounded-lg border border-white/12 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>
              <button
                type="button"
                onClick={() => onSaveIntegrations(integrationDraft)}
                className="primary-action rounded-lg px-4 py-3 text-sm font-black transition"
              >
                Salvar integrações
              </button>
            </div>
          </section>
        </div>

        <section className="glass-card mt-6 rounded-xl p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Editor de catálogo</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Catálogo base: {opportunityCatalog.length} oportunidades. Customizadas:{" "}
                {customCatalog.length}. Novos itens entram no motor dos próximos mapas.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                downloadJson("catalogo-inema-ai-map.json", {
                  base: opportunityCatalog,
                  custom: customCatalog,
                })
              }
              className="secondary-action rounded-lg px-4 py-3 text-sm font-black transition"
            >
              Exportar catálogo
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            <AdminInput
              label="Título"
              value={catalogDraft.title}
              onChange={(value) => onCatalogDraftChange({ ...catalogDraft, title: value })}
            />
            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Área
              <select
                value={catalogDraft.area}
                onChange={(event) =>
                  onCatalogDraftChange({
                    ...catalogDraft,
                    area: event.target.value as BusinessArea,
                  })
                }
                className="rounded-lg border border-white/12 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-cyan-300"
              >
                {businessAreas.map((area) => (
                  <option key={area}>{area}</option>
                ))}
              </select>
            </label>
            <AdminInput
              label="Problema"
              value={catalogDraft.problem}
              onChange={(value) => onCatalogDraftChange({ ...catalogDraft, problem: value })}
            />
            <AdminInput
              label="Solução"
              value={catalogDraft.solution}
              onChange={(value) => onCatalogDraftChange({ ...catalogDraft, solution: value })}
            />
            <AdminInput
              label="Palavras-chave"
              value={catalogDraft.keywords}
              onChange={(value) => onCatalogDraftChange({ ...catalogDraft, keywords: value })}
            />
          </div>

          <button
            type="button"
            onClick={onAddCatalogItem}
            className="primary-action mt-5 rounded-lg px-4 py-3 text-sm font-black transition"
          >
            Adicionar ao motor local
          </button>

          {customCatalog.length > 0 ? (
            <div className="mt-6 grid gap-3">
              {customCatalog.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-white/10 bg-slate-950/45 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-black text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.area} · {item.triggerKeywords.join(", ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveCatalogItem(item.id)}
                    className="rounded-lg border border-rose-300/30 px-3 py-2 text-sm font-black text-rose-100 transition hover:bg-rose-300 hover:text-slate-950"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function AdminInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-200">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-white/12 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-cyan-300"
      />
    </label>
  );
}

function DashboardView({
  answers,
  filters,
  leadForm,
  onCopy,
  onExportJson,
  onFilterChange,
  onInterest,
  onLeadChange,
  onLeadSkip,
  onLeadSubmit,
  onPrint,
  onRestart,
  onSelectOpportunity,
  onShare,
  report,
  reportUnlocked,
}: {
  answers: DiagnosisAnswers;
  filters: FilterState;
  leadForm: LeadProfile;
  onCopy: () => void;
  onExportJson: () => void;
  onFilterChange: (filters: FilterState) => void;
  onInterest: (context: InterestContext) => void;
  onLeadChange: (lead: LeadProfile) => void;
  onLeadSkip: () => void;
  onLeadSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPrint: () => void;
  onRestart: () => void;
  onSelectOpportunity: (opportunity: RecommendedOpportunity) => void;
  onShare: () => void;
  report: OpportunityMap;
  reportUnlocked: boolean;
}) {
  const filteredOpportunities = useMemo(
    () =>
      report.opportunities.filter((opportunity) => {
        const areaMatch = filters.area === "Todas" || opportunity.area === filters.area;
        const impactMatch =
          filters.impact === "Todos" || opportunity.impactLevel === filters.impact;
        const effortMatch =
          filters.effort === "Todos" || opportunity.effortLevel === filters.effort;
        const priorityMatch =
          filters.priority === "Todas" || opportunity.priorityLevel === filters.priority;

        return areaMatch && impactMatch && effortMatch && priorityMatch;
      }),
    [filters, report.opportunities],
  );

  return (
    <main className="dashboard-shell bg-transparent">
      <section className="dashboard-hero border-b border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_86%_10%,rgba(86,246,176,0.12),transparent_28%),linear-gradient(180deg,rgba(3,7,18,0.45),rgba(3,7,18,0.86))] py-10 print:bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="brand-pill inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] print:border-slate-300 print:bg-white print:text-slate-700">
                Dashboard de resultados
              </p>
              <h1 className="mt-4 text-balance text-3xl font-black text-white print:text-slate-950 sm:text-5xl">
                Mapa de Oportunidades para {answers.companyName || "sua empresa"}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300 print:text-slate-700">
                {report.executiveSummary}
              </p>
            </div>
            <div className="no-print flex flex-wrap gap-2 lg:justify-end">
              <ActionButton onClick={onCopy}>Copiar resumo</ActionButton>
              <ActionButton onClick={onExportJson}>Exportar JSON</ActionButton>
              <ActionButton onClick={onPrint}>Imprimir ou PDF</ActionButton>
              <ActionButton onClick={onShare}>Compartilhar</ActionButton>
              <ActionButton onClick={onRestart}>Reiniciar</ActionButton>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Maturidade em IA" value={`${report.maturityScore}/100`} />
            <MetricCard
              label="Oportunidades identificadas"
              value={String(report.opportunities.length)}
            />
            <MetricCard
              label="Horas potenciais por mês"
              value={`${report.totalEstimatedHoursSavedMonthly}h`}
            />
            <MetricCard label="Áreas com maior potencial" value={report.topAreas.join(", ")} />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-6 lg:grid-cols-[0.74fr_0.26fr] lg:px-8">
          <div className="grid gap-6">
            <VisualMap report={report} />
            <Bottlenecks report={report} />
            <ImpactEffortChart opportunities={report.opportunities} />
          </div>
          <aside className="grid content-start gap-6">
            {!reportUnlocked ? (
              <LeadCapturePanel
                leadForm={leadForm}
                onChange={onLeadChange}
                onSkip={onLeadSkip}
                onSubmit={onLeadSubmit}
              />
            ) : null}
            {report.aiBrief ? <AiBriefPanel aiBrief={report.aiBrief} /> : null}
            <Assumptions assumptions={report.assumptions} />
          </aside>
        </div>
      </section>

      <section className="dashboard-opportunities border-y border-white/10 bg-[#07101f]/82 py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Lista priorizada"
              title="Oportunidades recomendadas"
              description="Use os filtros para comparar oportunidades por área, impacto, esforço e prioridade."
            />
            <Filters filters={filters} onChange={onFilterChange} />
          </div>

          {filteredOpportunities.length === 0 ? (
            <div className="glass-card mt-8 rounded-lg p-6 text-slate-300">
              Nenhuma oportunidade encontrada com esses filtros.
            </div>
          ) : (
            <div className="mt-8 grid gap-5">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  answers={answers}
                  opportunity={opportunity}
                  onInterest={onInterest}
                  onSelect={onSelectOpportunity}
                  reportUnlocked={reportUnlocked}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-roadmap bg-transparent py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Plano de ação"
            title="Implementação em 7, 30 e 90 dias"
            description="O plano prioriza pilotos pequenos, validação com dados reais e expansão gradual."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <PlanCard title="7 dias" items={report.implementationPlan.sevenDays} />
            <PlanCard title="30 dias" items={report.implementationPlan.thirtyDays} />
            <PlanCard title="90 dias" items={report.implementationPlan.ninetyDays} />
          </div>
        </div>
      </section>
    </main>
  );
}

function ActionButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="secondary-action rounded-lg px-4 py-3 text-sm font-black transition"
    >
      {children}
    </button>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="glass-card rounded-lg p-5 print:border-slate-200 print:bg-white">
      <p className="text-sm font-bold text-slate-400 print:text-slate-600">{label}</p>
      <p className="mt-3 text-2xl font-black text-white print:text-slate-950">{value}</p>
    </article>
  );
}

function VisualMap({ report }: { report: OpportunityMap }) {
  const topOpportunities = report.opportunities.slice(0, 3);

  return (
    <section className="glass-panel rounded-xl p-5 sm:p-6 print:border-slate-200 print:bg-white">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-200 print:text-slate-700">
            Mapa principal
          </p>
          <h2 className="mt-2 text-2xl font-black text-white print:text-slate-950">
            Problema - Oportunidade - Solução de IA - Impacto - Próxima ação
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {topOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="map-lane grid gap-2 rounded-lg border border-white/10 bg-slate-950/50 p-3 sm:grid-cols-5 print:border-slate-200 print:bg-slate-50"
          >
            <MapCell label="Problema" value={opportunity.problem} />
            <MapCell label="Oportunidade" value={opportunity.title} />
            <MapCell label="Solução de IA" value={opportunity.agent} />
            <MapCell label="Impacto" value={opportunity.impactLevel} accent="green" />
            <MapCell label="Próxima ação" value={opportunity.nextAction} accent="cyan" />
          </div>
        ))}
      </div>
    </section>
  );
}

function MapCell({
  accent = "default",
  label,
  value,
}: {
  accent?: "default" | "green" | "cyan";
  label: string;
  value: string;
}) {
  return (
    <div
      className={`rounded-md p-3 ${
        accent === "green"
          ? "bg-emerald-300/12 text-emerald-100 print:bg-emerald-50 print:text-slate-950"
          : accent === "cyan"
            ? "bg-cyan-300/12 text-cyan-100 print:bg-cyan-50 print:text-slate-950"
            : "bg-white/[0.045] text-slate-200 print:bg-white print:text-slate-800"
      }`}
    >
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 print:text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold leading-6">{value}</p>
    </div>
  );
}

function Bottlenecks({ report }: { report: OpportunityMap }) {
  return (
    <section className="glass-card rounded-xl p-5 sm:p-6 print:border-slate-200 print:bg-white">
      <h2 className="text-2xl font-black text-white print:text-slate-950">
        Principais gargalos
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {report.bottlenecks.map((bottleneck) => (
          <div
            key={bottleneck}
            className="rounded-lg border border-white/10 bg-slate-950/38 p-4 text-sm font-bold leading-6 text-slate-200 print:border-slate-200 print:bg-slate-50 print:text-slate-800"
          >
            {bottleneck}
          </div>
        ))}
      </div>
    </section>
  );
}

function ImpactEffortChart({ opportunities }: { opportunities: RecommendedOpportunity[] }) {
  return (
    <section className="glass-card rounded-xl p-5 sm:p-6 print:border-slate-200 print:bg-white">
      <h2 className="text-2xl font-black text-white print:text-slate-950">
        Impacto versus esforço
      </h2>
      <div
        className="relative mt-6 h-72 overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_70%_25%,rgba(86,246,176,0.13),transparent_28%),rgba(2,6,18,0.65)] p-4 print:border-slate-200 print:bg-slate-50"
        role="img"
        aria-label="Gráfico de impacto versus esforço das oportunidades"
      >
        <div className="absolute bottom-4 left-4 right-4 border-t border-white/15 print:border-slate-300" />
        <div className="absolute bottom-4 left-4 top-4 border-l border-white/15 print:border-slate-300" />
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400">
          Esforço
        </span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-slate-400">
          Impacto
        </span>
        {opportunities.slice(0, 8).map((opportunity, index) => {
          const left = 12 + opportunity.effort * 18;
          const bottom = 14 + opportunity.baseImpact * 15;

          return (
            <div
              key={opportunity.id}
              className="absolute max-w-[140px]"
              style={{ left: `${left}%`, bottom: `${bottom}%` }}
            >
              <div
                className={`h-4 w-4 rounded-full border border-white/70 ${
                  index < 3 ? "bg-emerald-300" : "bg-cyan-300"
                }`}
                title={opportunity.title}
              />
              <span className="mt-1 block truncate text-[11px] font-bold text-slate-300 print:text-slate-700">
                {opportunity.title}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LeadCapturePanel({
  leadForm,
  onChange,
  onSkip,
  onSubmit,
}: {
  leadForm: LeadProfile;
  onChange: (lead: LeadProfile) => void;
  onSkip: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="glass-card no-print rounded-xl p-5"
    >
      <h2 className="text-xl font-black text-white">Liberar relatório completo</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        O contato é opcional neste MVP. Use para simular captura antes do relatório
        completo.
      </p>
      <label className="mt-5 grid gap-2 text-sm font-bold text-slate-200">
        Nome
        <input
          value={leadForm.name}
          onChange={(event) => onChange({ ...leadForm, name: event.target.value })}
          className="rounded-lg border border-white/12 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-cyan-300"
          placeholder="Seu nome"
        />
      </label>
      <label className="mt-4 grid gap-2 text-sm font-bold text-slate-200">
        E-mail
        <input
          value={leadForm.email}
          onChange={(event) => onChange({ ...leadForm, email: event.target.value })}
          className="rounded-lg border border-white/12 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-cyan-300"
          placeholder="voce@empresa.com"
          type="email"
        />
      </label>
      <button
        type="submit"
        className="primary-action mt-5 w-full rounded-lg px-4 py-3 text-sm font-black transition"
      >
        Liberar e salvar contato
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="secondary-action mt-3 w-full rounded-lg px-4 py-3 text-sm font-black transition"
      >
        Ver sem informar
      </button>
    </form>
  );
}

function Assumptions({ assumptions }: { assumptions: string[] }) {
  return (
    <section className="glass-card rounded-xl p-5 print:border-slate-200 print:bg-white">
      <h2 className="text-xl font-black text-white print:text-slate-950">Premissas</h2>
      <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-300 print:text-slate-700">
        {assumptions.map((assumption) => (
          <li key={assumption} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300" />
            {assumption}
          </li>
        ))}
      </ul>
    </section>
  );
}

function AiBriefPanel({ aiBrief }: { aiBrief: NonNullable<OpportunityMap["aiBrief"]> }) {
  return (
    <section className="glass-card rounded-xl p-5 print:border-slate-200 print:bg-white">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-200 print:text-slate-700">
        Briefing IA
      </p>
      <h2 className="mt-2 text-xl font-black text-white print:text-slate-950">
        Próxima melhor ação
      </h2>
      <p className="mt-3 text-sm font-bold leading-6 text-slate-200 print:text-slate-700">
        {aiBrief.firstAction || "Validar o primeiro piloto com dados reais."}
      </p>
      {aiBrief.suggestedNextActions.length > 0 ? (
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-300 print:text-slate-700">
          {aiBrief.suggestedNextActions.map((action) => (
            <li key={action} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
              {action}
            </li>
          ))}
        </ul>
      ) : null}
      {aiBrief.riskNotes.length > 0 ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/35 p-3 print:border-slate-200 print:bg-slate-50">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
            Cuidados
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-700">
            {aiBrief.riskNotes.join(" ")}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function Filters({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}) {
  return (
    <div className="no-print grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SelectField
        label="Área"
        value={filters.area}
        onChange={(value) => onChange({ ...filters, area: value as FilterState["area"] })}
        options={["Todas", ...businessAreas]}
      />
      <SelectField
        label="Impacto"
        value={filters.impact}
        onChange={(value) => onChange({ ...filters, impact: value as FilterState["impact"] })}
        options={["Todos", "Baixo", "Médio", "Alto", "Muito alto"]}
      />
      <SelectField
        label="Esforço"
        value={filters.effort}
        onChange={(value) => onChange({ ...filters, effort: value as FilterState["effort"] })}
        options={["Todos", "Baixo", "Médio", "Alto"]}
      />
      <SelectField
        label="Prioridade"
        value={filters.priority}
        onChange={(value) =>
          onChange({ ...filters, priority: value as FilterState["priority"] })
        }
        options={["Todas", "Alta", "Média", "Exploratória"]}
      />
    </div>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
}) {
  return (
    <label className="grid min-w-[150px] gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-white/12 bg-slate-950 px-3 py-3 text-sm font-bold normal-case tracking-normal text-white outline-none focus:border-cyan-300"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function OpportunityCard({
  answers,
  onInterest,
  onSelect,
  opportunity,
  reportUnlocked,
}: {
  answers: DiagnosisAnswers;
  onInterest: (context: InterestContext) => void;
  onSelect: (opportunity: RecommendedOpportunity) => void;
  opportunity: RecommendedOpportunity;
  reportUnlocked: boolean;
}) {
  return (
    <article className="glass-card focus-ring rounded-xl p-5 print:border-slate-200 print:bg-white sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge>{opportunity.area}</Badge>
            <Badge>{opportunity.priorityLevel}</Badge>
            <Badge>{opportunity.score}/100</Badge>
          </div>
          <h3 className="mt-4 text-balance text-2xl font-black text-white print:text-slate-950">
            {opportunity.title}
          </h3>
          <p className="mt-3 leading-7 text-slate-300 print:text-slate-700">
            {opportunity.solution}
          </p>
        </div>
        <div className="grid min-w-[210px] gap-2 text-sm">
          <MiniStat label="Impacto" value={opportunity.impactLevel} />
          <MiniStat label="Esforço" value={opportunity.effortLevel} />
          <MiniStat
            label="Economia indicativa"
            value={`${opportunity.estimatedHoursSavedMonthly}h/mês`}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoBlock title="Problema identificado" text={opportunity.problem} />
        <InfoBlock title="Agente recomendado" text={opportunity.agent} />
      </div>

      <div className="mt-5">
        <p className="text-sm font-black uppercase tracking-[0.12em] text-slate-400">
          Prompt inicial
        </p>
        <div
          className={`mt-2 rounded-lg border border-white/10 bg-slate-950/60 p-4 text-sm leading-7 text-slate-200 print:border-slate-200 print:bg-slate-50 print:text-slate-800 ${
            reportUnlocked ? "" : "relative"
          }`}
        >
          {reportUnlocked ? (
            personalizePrompt(opportunity.prompt, answers)
          ) : (
            <span className="text-slate-400">
              Libere o relatório completo para ver o prompt inicial e detalhes.
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {opportunity.tools.map((tool) => (
          <span
            key={tool}
            className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.07] px-3 py-2 text-xs font-bold text-cyan-100 print:border-slate-200 print:bg-white print:text-slate-700"
          >
            {tool}
          </span>
        ))}
      </div>

      <div className="no-print mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => onInterest({ type: "opportunity", label: opportunity.title })}
          className="primary-action rounded-lg px-4 py-3 text-sm font-black transition"
        >
          Criar esta solução
        </button>
        <button
          type="button"
          onClick={() => onSelect(opportunity)}
          className="secondary-action rounded-lg px-4 py-3 text-sm font-black transition"
        >
          Ver plano de implementação
        </button>
      </div>
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-white/12 bg-white/[0.065] px-3 py-1.5 text-xs font-black text-slate-200 print:border-slate-200 print:bg-slate-50 print:text-slate-700">
      {children}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/52 p-3 print:border-slate-200 print:bg-slate-50">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 font-black text-white print:text-slate-950">{value}</p>
    </div>
  );
}

function InfoBlock({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/34 p-4 print:border-slate-200 print:bg-slate-50">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-700">{text}</p>
    </div>
  );
}

function PlanCard({ items, title }: { items: string[]; title: string }) {
  return (
    <article className="glass-card rounded-xl p-5 print:border-slate-200 print:bg-white">
      <h3 className="text-2xl font-black text-white print:text-slate-950">{title}</h3>
      <ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-300 print:text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function OpportunityModal({
  answers,
  onClose,
  onInterest,
  opportunity,
}: {
  answers: DiagnosisAnswers;
  onClose: () => void;
  onInterest: (context: InterestContext) => void;
  opportunity: RecommendedOpportunity;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/78 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="opportunity-title"
    >
      <div className="glass-panel max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-200">
              Detalhe da oportunidade
            </p>
            <h2 id="opportunity-title" className="mt-3 text-3xl font-black text-white">
              {opportunity.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="secondary-action rounded-lg px-3 py-2 text-sm font-black transition"
            aria-label="Fechar detalhe"
          >
            Fechar
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <InfoBlock title="Diagnóstico" text={opportunity.problem} />
          <InfoBlock title="Resultado esperado" text={opportunity.solution} />
          <InfoBlock title="Ferramentas necessárias" text={opportunity.tools.join(", ")} />
          <InfoBlock title="Indicadores" text={opportunity.metrics.join(", ")} />
        </div>

        <DetailList title="Etapas de implementação" items={opportunity.implementationSteps} />
        <DetailList title="Riscos e cuidados" items={opportunity.risks} />

        <div className="mt-6 rounded-lg border border-white/10 bg-slate-950/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-slate-400">
            Prompt inicial
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            {personalizePrompt(opportunity.prompt, answers)}
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-emerald-200/24 bg-emerald-300/[0.08] p-5">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">
            Próximo passo
          </p>
          <p className="mt-3 leading-7 text-slate-200">{opportunity.nextAction}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onInterest({ type: "implementation", label: opportunity.title })}
            className="primary-action rounded-lg px-5 py-3 text-sm font-black transition"
          >
            Quero implementar esta oportunidade
          </button>
          <button
            type="button"
            onClick={onClose}
            className="secondary-action rounded-lg px-5 py-3 text-sm font-black transition"
          >
            Voltar ao mapa
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-black text-white">{title}</h3>
      <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InterestModal({
  context,
  integrationSettings,
  onClose,
}: {
  context: NonNullable<InterestContext>;
  integrationSettings: IntegrationSettings;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState("Registro local.");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      context,
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      crmName: integrationSettings.crmName,
      createdAt: new Date().toISOString(),
    };

    if (integrationSettings.webhookUrl) {
      try {
        await fetch(integrationSettings.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setDeliveryStatus("Registro local e webhook acionado.");
      } catch {
        setDeliveryStatus("Registro local salvo. O webhook configurado não respondeu.");
      }
    } else {
      setDeliveryStatus("Registro local. Nenhum webhook configurado.");
    }

    setSubmitted(true);
    trackEvent("implementation_interest", {
      type: context.type,
      label: context.label,
      hasWebhook: Boolean(integrationSettings.webhookUrl),
    });
  }

  const whatsappHref = integrationSettings.whatsappNumber
    ? `https://wa.me/${integrationSettings.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Tenho interesse em ${context.label}.`,
      )}`
    : "";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/78 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interest-title"
    >
      <div className="glass-panel w-full max-w-lg rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-200">
              Lista de interesse
            </p>
            <h2 id="interest-title" className="mt-3 text-2xl font-black text-white">
              {context.label}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="secondary-action rounded-lg px-3 py-2 text-sm font-black"
          >
            Fechar
          </button>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-5">
            <p className="font-black text-emerald-100">{deliveryStatus}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Nesta versão, dados só são enviados externamente quando um webhook foi
              configurado no Admin.
            </p>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="primary-action mt-4 inline-flex rounded-lg px-4 py-3 text-sm font-black transition"
              >
                Abrir WhatsApp configurado
              </a>
            ) : null}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Nome
              <input
                name="name"
                required
                className="rounded-lg border border-white/12 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-cyan-300"
                placeholder="Seu nome"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-200">
              E-mail
              <input
                name="email"
                required
                className="rounded-lg border border-white/12 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-cyan-300"
                placeholder="voce@empresa.com"
                type="email"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Contexto
              <textarea
                name="message"
                className="min-h-24 rounded-lg border border-white/12 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-cyan-300"
                defaultValue={`Tenho interesse em ${context.label}.`}
              />
            </label>
            <button
              type="submit"
              className="primary-action rounded-lg px-4 py-3 text-sm font-black transition"
            >
              Entrar na lista
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#030711]/88 py-10 print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="font-black tracking-[0.16em] text-white">INEMA.AI MAP</p>
        <p>
          MVP demonstrável com diagnóstico local, recomendações por regras e estrutura
          preparada para IA server-side.
        </p>
      </div>
    </footer>
  );
}
