"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type TodayResponse = {
  targetCalories: number;
  consumedCalories: number;
  remainingCalories: number;
};

export default function FoodLogPage() {
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [rawText, setRawText] = useState("2 eggs, sourdough toast, cold brew");
  const [mealType, setMealType] = useState("breakfast");
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/targets/today");
    if (!response.ok) {
      setToday(null);
      return;
    }
    const data: TodayResponse = await response.json();
    setToday(data);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function submitLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setNote(null);
    try {
      const response = await fetch("/api/food/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, mealType })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to log entry.");
      }
      setNote(
        data.needsConfirmation
          ? "Logged with medium confidence — adjust portions if needed."
          : "Meal logged with higher confidence."
      );
      await refresh();
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-fade-in space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-tan">Daily logging</p>
        <h1 className="font-display text-3xl text-forest">Natural-language diary</h1>
        <p className="mt-2 max-w-3xl text-sm text-forest-muted">
          Uses the bundled food resolver + macro math from the legacy MVP. Photo + Claude vision slots in behind the same POST
          contract.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-4 rounded-3xl border border-border bg-white p-6 shadow-sm shadow-black/5" onSubmit={submitLog}>
          <label className="text-sm text-forest-muted">
            Describe the meal
            <textarea className="field-input mt-2 min-h-[120px]" value={rawText} onChange={(e) => setRawText(e.target.value)} />
          </label>
          <label className="text-sm text-forest-muted">
            Meal type
            <input className="field-input" value={mealType} onChange={(e) => setMealType(e.target.value)} />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-forest py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Logging…" : "Log meal"}
          </button>
          {note && <p className="text-sm text-fern">{note}</p>}
        </form>

        <aside className="space-y-4 rounded-3xl border border-border bg-stone-bg/80 p-6 text-sm text-forest-muted">
          <p className="text-xs uppercase tracking-[0.3em] text-tan">Today</p>
          {today ? (
            <dl className="space-y-3 font-mono text-base text-forest">
              <div className="flex justify-between">
                <dt>Target</dt>
                <dd>{today.targetCalories} kcal</dd>
              </div>
              <div className="flex justify-between">
                <dt>Consumed</dt>
                <dd>{today.consumedCalories} kcal</dd>
              </div>
              <div className="flex justify-between">
                <dt>Remaining</dt>
                <dd>{today.remainingCalories} kcal</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-tan">
              Calorie targets missing — complete <a className="font-semibold text-forest underline" href="/setup">calorie setup</a>{" "}
              first.
            </p>
          )}
          <button
            type="button"
            className="w-full rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-forest hover:border-forest"
            onClick={() => refresh()}
          >
            Refresh totals
          </button>
        </aside>
      </section>
    </div>
  );
}
