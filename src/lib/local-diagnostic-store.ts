import type { DiagnosisAnswers, LeadProfile, OpportunityMap } from "../types/inema-map";

const diagnosisKey = "inema-ai-map:diagnosis";
const reportKey = "inema-ai-map:report";
const leadKey = "inema-ai-map:lead";

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

export function clearInemaMapStorage() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(diagnosisKey);
  window.localStorage.removeItem(reportKey);
  window.localStorage.removeItem(leadKey);
}
