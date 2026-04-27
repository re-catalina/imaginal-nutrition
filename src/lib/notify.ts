/** Twilio replacement for local/dev — logs instead of sending. */

export type NotifyChannel = "sms" | "whatsapp";

export type NotifyPayload = {
  channel: NotifyChannel;
  to: string;
  body: string;
  meta?: Record<string, unknown>;
};

export function logNotifyStub(payload: NotifyPayload): void {
  const label = payload.channel === "sms" ? "SMS (Twilio stub)" : "WhatsApp (Twilio stub)";
  console.info(`[${label}]`, {
    to: payload.to,
    body: payload.body,
    ...(payload.meta ? { meta: payload.meta } : {})
  });
}
