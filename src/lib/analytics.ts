type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const event = {
    eventName,
    payload,
    timestamp: new Date().toISOString(),
  };

  window.dispatchEvent(new CustomEvent("inema-ai-map:analytics", { detail: event }));

  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", event);
  }
}
