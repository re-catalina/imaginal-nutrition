"use client";

import { FormEvent, useState } from "react";

export default function SettingsPage() {
  const [channel, setChannel] = useState<"sms" | "whatsapp">("sms");
  const [to, setTo] = useState("+15555550123");
  const [note, setNote] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function sendTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNote(null);
    try {
      const response = await fetch("/api/notify/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          to,
          body: "Hey — ready to plan the week? Reply STOP to opt out (stub)."
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to send stub notification.");
      }
      setNote("Logged to the server console — Twilio keys not required yet.");
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="page-fade-in mx-auto max-w-3xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-tan">Household controls</p>
        <h1 className="font-display text-3xl text-forest">Settings</h1>
        <p className="mt-2 text-sm text-forest-muted">
          Notification channels honor the doc’s SMS/WhatsApp fallback — messages never include sensitive health details in
          production.
        </p>
      </header>

      <section className="rounded-3xl border border-border bg-white p-8 shadow-sm shadow-black/5">
        <h2 className="text-lg font-semibold text-forest">Notification dry run</h2>
        <p className="mt-2 text-sm text-forest-muted">
          Watch your terminal running `next dev` — Twilio sends are stubbed via `console.info`.
        </p>
        <form className="mt-6 space-y-4" onSubmit={sendTest}>
          <label className="text-sm text-forest-muted">
            Channel
            <select className="field-input" value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)}>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>
          <label className="text-sm text-forest-muted">
            Destination
            <input className="field-input" value={to} onChange={(e) => setTo(e.target.value)} required />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send stub notification"}
          </button>
          {note && <p className="text-sm text-fern">{note}</p>}
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-stone-bg/70 p-8 text-sm text-forest-muted">
        <h2 className="text-lg font-semibold text-forest">Privacy reminders</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Nemo stays scoped to nutrition + fitness journeys.</li>
          <li>Consumer health data stays out of analytics payloads — keep that rule when wiring telemetry.</li>
          <li>Legal pages (`/terms`, `/privacy`) still need counsel-approved copy before beta households onboard broadly.</li>
        </ul>
      </section>
    </div>
  );
}
