import type { DiagnosisAnswers } from "../types/inema-map";

export const emptyDiagnosis: DiagnosisAnswers = {
  companyName: "",
  segment: "",
  teamSize: "",
  timeConsumingAreas: [],
  currentProblems: [],
  customProblems: "",
  goal90Days: "",
  toolsUsed: [],
  customTools: "",
  aiMaturity: "",
  repetitiveHoursPerWeek: "",
  priority: "",
};

export const clinicDemoDiagnosis: DiagnosisAnswers = {
  companyName: "Clínica Aurora",
  segment: "Clínica",
  teamSize: 18,
  timeConsumingAreas: ["Atendimento", "Operações", "Gestão", "Conteúdo"],
  currentProblems: [
    "Muitas dúvidas repetidas chegam pelo WhatsApp todos os dias",
    "Pacientes faltam às consultas por falta de confirmação automática",
    "A clínica não tem rotina para recuperar pacientes inativos",
    "A equipe demora para consolidar indicadores de agenda e atendimento",
    "Falta consistência na produção de conteúdo educativo",
  ],
  customProblems:
    "Os dados de agenda ficam em lugares diferentes e o gestor só enxerga os gargalos no fim do mês.",
  goal90Days: "melhorar-atendimento",
  toolsUsed: ["WhatsApp Business", "Google Agenda", "Google Sheets", "Instagram"],
  customTools: "Sistema de prontuário e agenda interna",
  aiMaturity: "inicial",
  repetitiveHoursPerWeek: 24,
  priority: "ganhar tempo",
  lead: {
    name: "Demonstração INEMA",
    email: "demo@inema.ai",
    companyRole: "Gestão",
  },
};
