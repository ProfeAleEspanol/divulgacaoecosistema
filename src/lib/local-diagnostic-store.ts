import type {
  DiagnosisAnswers,
  IntegrationSettings,
  LeadProfile,
  MapHistoryItem,
  OpportunityMap,
  OpportunityTemplate,
  WorkspaceProfile,
} from "../types/inema-map";

const diagnosisKey = "inema-ai-map:diagnosis";
const reportKey = "inema-ai-map:report";
const leadKey = "inema-ai-map:lead";
const historyKey = "inema-ai-map:history";
const workspaceKey = "inema-ai-map:workspace";
const integrationsKey = "inema-ai-map:integrations";
const customCatalogKey = "inema-ai-map:custom-catalog";

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local persistence is a convenience in the MVP. The app still works without it.
  }
}

export function loadDiagnosisDraft() {
  return readJson<DiagnosisAnswers>(diagnosisKey);
}

export function saveDiagnosisDraft(answers: DiagnosisAnswers) {
  writeJson(diagnosisKey, answers);
}

export function loadSavedReport() {
  return readJson<OpportunityMap>(reportKey);
}

export function saveReport(report: OpportunityMap) {
  writeJson(reportKey, report);
}

export function loadLeadProfile() {
  return readJson<LeadProfile>(leadKey);
}

export function saveLeadProfile(lead: LeadProfile) {
  writeJson(leadKey, lead);
}

export function loadMapHistory() {
  return readJson<MapHistoryItem[]>(historyKey) ?? [];
}

export function saveMapHistoryItem(item: MapHistoryItem) {
  const history = loadMapHistory();
  const nextHistory = [item, ...history.filter((entry) => entry.id !== item.id)].slice(0, 20);
  writeJson(historyKey, nextHistory);
  return nextHistory;
}

export function deleteMapHistoryItem(id: string) {
  const nextHistory = loadMapHistory().filter((entry) => entry.id !== id);
  writeJson(historyKey, nextHistory);
  return nextHistory;
}

export function loadWorkspaceProfile() {
  return (
    readJson<WorkspaceProfile>(workspaceKey) ?? {
      workspaceName: "INEMA.AI MAP",
      ownerName: "",
      ownerEmail: "",
      authMode: "local",
    }
  );
}

export function saveWorkspaceProfile(profile: WorkspaceProfile) {
  writeJson(workspaceKey, profile);
}

export function loadIntegrationSettings() {
  return (
    readJson<IntegrationSettings>(integrationsKey) ?? {
      crmName: "",
      webhookUrl: "",
      whatsappNumber: "",
      notes: "",
    }
  );
}

export function saveIntegrationSettings(settings: IntegrationSettings) {
  writeJson(integrationsKey, settings);
}

export function loadCustomCatalog() {
  return readJson<OpportunityTemplate[]>(customCatalogKey) ?? [];
}

export function saveCustomCatalog(catalog: OpportunityTemplate[]) {
  writeJson(customCatalogKey, catalog);
}

export function clearInemaMapStorage() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(diagnosisKey);
  window.localStorage.removeItem(reportKey);
  window.localStorage.removeItem(leadKey);
}
