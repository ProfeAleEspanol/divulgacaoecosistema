import test from "node:test";
import assert from "node:assert/strict";
import { clinicDemoDiagnosis } from "../src/data/demo-diagnosis";
import { opportunityCatalog } from "../src/data/opportunities";
import { generateOpportunityMap } from "../src/lib/recommendation-engine";
import type { DiagnosisAnswers } from "../src/types/inema-map";

test("catalog has at least 12 opportunities across the required areas", () => {
  const areas = new Set(opportunityCatalog.map((opportunity) => opportunity.area));

  assert.ok(opportunityCatalog.length >= 12);
  assert.ok(areas.has("Atendimento"));
  assert.ok(areas.has("Marketing"));
  assert.ok(areas.has("Vendas"));
  assert.ok(areas.has("Operações"));
  assert.ok(areas.has("Gestão"));
  assert.ok(areas.has("Financeiro"));
  assert.ok(areas.has("Recursos Humanos"));
  assert.ok(areas.has("Conteúdo"));
});

test("clinic demo prioritizes realistic clinic opportunities", () => {
  const report = generateOpportunityMap(clinicDemoDiagnosis);
  const topTitles = report.opportunities.slice(0, 6).map((opportunity) => opportunity.title);

  assert.equal(report.opportunities.length >= 3, true);
  assert.ok(report.totalEstimatedHoursSavedMonthly > 0);
  assert.ok(topTitles.some((title) => title.includes("atendimento")));
  assert.ok(topTitles.some((title) => title.includes("agenda") || title.includes("faltas")));
  assert.ok(topTitles.some((title) => title.includes("inativos")));
});

test("sales context changes recommendation priority", () => {
  const salesDiagnosis: DiagnosisAnswers = {
    companyName: "Beta Consultoria",
    segment: "Consultoria",
    teamSize: 7,
    timeConsumingAreas: ["Vendas", "Marketing"],
    currentProblems: [
      "Baixa conversão comercial",
      "Leads sem follow-up",
      "Propostas demoram para sair",
    ],
    customProblems: "CRM desorganizado e propostas paradas",
    goal90Days: "vender-mais",
    toolsUsed: ["CRM", "WhatsApp Business"],
    customTools: "",
    aiMaturity: "inicial",
    repetitiveHoursPerWeek: 18,
    priority: "vender mais",
  };

  const report = generateOpportunityMap(salesDiagnosis);
  const firstThreeIds = report.opportunities.slice(0, 3).map((opportunity) => opportunity.id);

  assert.ok(firstThreeIds.includes("sales-follow-up-agent"));
  assert.ok(firstThreeIds.includes("proposal-generator"));
});

test("content bottleneck elevates content agent", () => {
  const contentDiagnosis: DiagnosisAnswers = {
    companyName: "Norte Cursos",
    segment: "Infoprodutor",
    teamSize: 4,
    timeConsumingAreas: ["Conteúdo", "Marketing"],
    currentProblems: [
      "Dificuldade para produzir conteúdo",
      "Falta calendário de posts",
      "Equipe demora para criar roteiros",
    ],
    customProblems: "",
    goal90Days: "vender-mais",
    toolsUsed: ["Instagram", "Canva", "ChatGPT"],
    customTools: "",
    aiMaturity: "intermediaria",
    repetitiveHoursPerWeek: 16,
    priority: "ganhar tempo",
  };

  const report = generateOpportunityMap(contentDiagnosis);

  assert.equal(report.opportunities[0].id, "content-agent");
  assert.ok(report.maturityScore >= 60);
});
