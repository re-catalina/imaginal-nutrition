"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Today = {
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  targetFiberGrams: number;
  consumedCalories: number;
  consumedProteinGrams: number;
  consumedCarbsGrams: number;
  consumedFatGrams: number;
  consumedFiberGrams: number;
  remainingCalories: number;
};

export default function DashboardPage() {
  const [today, setToday] = useState<Today | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/targets/today");
      if (response.status === 404) {
        setToday(null);
        setError("Finish your calorie setup to unlock daily totals.");
        return;
      }
      if (!response.ok) {
        throw new Error("Unable to load targets.");
      }
      const data: Today = await response.json();
      setToday(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="page-fade-in space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">Today</h1>
        <p className="mt-2 max-w-2xl text-sm text-forest-muted">
          Macro snapshot based on your latest calorie target and everything logged today.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-border bg-white/70 p-8 shadow-sm shadow-black/5">
          <div className="h-40 animate-pulse rounded-2xl bg-border/80" aria-hidden />
        </div>
      ) : today ? (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm shadow-black/5">
            <p className="text-xs uppercase tracking-[0.2em] text-tan">Energy</p>
            <p className="mt-4 font-mono text-4xl text-forest">{today.remainingCalories}</p>
            <p className="text-sm text-forest-muted">calories remaining</p>
            <div className="mt-6 space-y-2 text-sm text-forest-muted">
              <div className="flex justify-between">
                <span>Target</span>
                <span className="font-mono text-forest">{today.targetCalories} kcal</span>
              </div>
              <div className="flex justify-between">
                <span>Logged</span>
                <span className="font-mono text-forest">{today.consumedCalories} kcal</span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm shadow-black/5">
            <p className="text-xs uppercase tracking-[0.2em] text-tan">Macros</p>
            <dl className="mt-4 space-y-3 text-sm">
              <MacroRow label="Protein" consumed={today.consumedProteinGrams} target={today.targetProteinGrams} unit="g" />
              <MacroRow label="Carbs" consumed={today.consumedCarbsGrams} target={today.targetCarbsGrams} unit="g" />
              <MacroRow label="Fat" consumed={today.consumedFatGrams} target={today.targetFatGrams} unit="g" />
              <MacroRow label="Fiber" consumed={today.consumedFiberGrams} target={today.targetFiberGrams} unit="g" />
            </dl>
          </div>
        </section>
      ) : (
        <div className="rounded-3xl border border-dashed border-tan/60 bg-white/80 p-8 text-sm text-forest-muted">
          <p>{error}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="rounded-full bg-forest px-5 py-2 text-sm font-semibold text-cream" href="/onboarding">
              Continue onboarding
            </Link>
            <Link className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-forest" href="/log">
              Go to food log
            </Link>
          </div>
        </div>
      )}

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm shadow-black/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-forest">Quick links</h2>
            <p className="text-sm text-forest-muted">Jump into the flows from the product spec.</p>
          </div>
          <button
            type="button"
            onClick={() => load()}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-forest hover:border-forest"
          >
            Refresh data
          </button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <DashboardQuickLink href="/nemo" title="Chat with Nemo" description="Scoped nutrition coaching." />
          <DashboardQuickLink href="/plan" title="Weekly plan" description="Sunday-style planning surface." />
          <DashboardQuickLink href="/grocery" title="Grocery list" description="Instacart hand-off (stubbed)." />
        </div>
      </section>
    </div>
  );
}

function MacroRow({
  label,
  consumed,
  target,
  unit
}: {
  label: string;
  consumed: number;
  target: number;
  unit: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-stone-bg px-4 py-3">
      <dt className="text-forest-muted">{label}</dt>
      <dd className="font-mono text-forest">
        {consumed.toFixed(1)}
        {unit} / {target.toFixed(1)}
        {unit}
      </dd>
    </div>
  );
}

function DashboardQuickLink<H extends `/nemo` | `/plan` | `/grocery`>({
  href,
  title,
  description
}: {
  href: H;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="card-hover rounded-2xl border border-border bg-stone-bg/80 p-4 transition-transform duration-ui hover:-translate-y-0.5"
    >
      <p className="font-semibold text-forest">{title}</p>
      <p className="mt-2 text-xs text-forest-muted">{description}</p>
    </Link>
  );
}
