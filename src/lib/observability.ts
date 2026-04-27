type EventPayload = {
  eventName: string;
  userId?: string;
  properties?: Record<string, unknown>;
};

/** Intentionally no DB write — replaces the old MetricEvent pipeline. */
export async function trackEvent(payload: EventPayload) {
  console.log(
    JSON.stringify({
      level: "info",
      type: "app_event",
      ...payload,
      timestamp: new Date().toISOString()
    })
  );
}
