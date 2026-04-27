"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PageBackButton } from "@/components/PageBackButton";

const PERSONALITIES = [
  {
    id: "SUPPORTIVE",
    title: "Supportive",
    sample: "You showed up today — that counts. Let’s keep protein steady while life feels loud."
  },
  {
    id: "DIRECT",
    title: "Direct",
    sample: "Here’s the trade-off: swap the second drink for sparkling water and you stay inside budget."
  },
  {
    id: "ANALYTICAL",
    title: "Analytical",
    sample: "Fiber is tracking 30% below goal; add one fruit + veg anchor at lunch."
  },
  {
    id: "PLAYFUL",
    title: "Playful",
    sample: "Kitchen dance break after meal prep? Optional. Hydration before snacks? Mandatory."
  }
] as const;

type MeJson = {
  onboardingComplete?: boolean;
  onboardingStep?: number;
  name?: string | null;
  household?: { name: string } | null;
  householdRole?: string;
  nemoPersonality?: string | null;
  notifyChannel?: string;
  weeklyPlanningDay?: string | null;
  checkInTime?: string | null;
  fitnessGoal?: string | null;
  groceryStoresNote?: string | null;
  instagramNote?: string | null;
};

/** DB uses 0 = pre-welcome; each completed screen advances `onboardingStep` to the next UI step index. */
function uiStepFromDb(dbStep: number): number {
  if (dbStep <= 0) return 1;
  return Math.min(Math.max(dbStep, 1), 6);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [householdName, setHouseholdName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [role, setRole] = useState<"MEAL_PLANNER" | "CONTRIBUTOR">("MEAL_PLANNER");
  const [personality, setPersonality] = useState<string>(PERSONALITIES[0].id);
  const [groceryStoresNote, setGroceryStoresNote] = useState("");
  const [instagramNote, setInstagramNote] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [notifyChannel, setNotifyChannel] = useState<"in_app" | "sms" | "whatsapp">("in_app");
  const [weeklyPlanningDay, setWeeklyPlanningDay] = useState<"friday" | "saturday" | "sunday">("sunday");
  const [checkInTime, setCheckInTime] = useState("09:00");

  const progress = useMemo(() => Math.round((step / 6) * 100), [step]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/me");
        if (!response.ok) return;
        const me = (await response.json()) as MeJson;
        if (cancelled) return;

        if (me.onboardingComplete) {
          router.replace("/dashboard");
          return;
        }

        setStep(uiStepFromDb(me.onboardingStep ?? 0));
        if (me.name) setFirstName(me.name);
        if (me.household?.name) setHouseholdName(me.household.name);
        if (me.householdRole === "CONTRIBUTOR" || me.householdRole === "MEAL_PLANNER") {
          setRole(me.householdRole);
        }
        if (me.nemoPersonality && PERSONALITIES.some((p) => p.id === me.nemoPersonality)) {
          setPersonality(me.nemoPersonality);
        }
        if (me.groceryStoresNote !== undefined && me.groceryStoresNote !== null) {
          setGroceryStoresNote(me.groceryStoresNote);
        }
        if (me.instagramNote !== undefined && me.instagramNote !== null) {
          setInstagramNote(me.instagramNote);
        }
        if (me.fitnessGoal !== undefined && me.fitnessGoal !== null) {
          setFitnessGoal(me.fitnessGoal);
        }
        if (me.notifyChannel === "in_app" || me.notifyChannel === "sms" || me.notifyChannel === "whatsapp") {
          setNotifyChannel(me.notifyChannel);
        }
        if (me.weeklyPlanningDay === "friday" || me.weeklyPlanningDay === "saturday" || me.weeklyPlanningDay === "sunday") {
          setWeeklyPlanningDay(me.weeklyPlanningDay);
        }
        if (me.checkInTime?.trim()) {
          setCheckInTime(me.checkInTime.trim());
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function savePatch(data: Record<string, unknown>) {
    setSaveError(null);
    setPending(true);
    try {
      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg =
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to save your progress — please try again.";
        throw new Error(msg);
      }
    } finally {
      setPending(false);
    }
  }

  async function handleBack() {
    if (step <= 1 || pending) return;
    const prev = step - 1;
    const dbStep = prev <= 1 ? 0 : prev;
    try {
      await savePatch({ onboardingStep: dbStep });
      setStep(prev);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Unable to go back.");
    }
  }

  async function handleNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError(null);
    if (step === 1) {
      try {
        await savePatch({ onboardingStep: 2 });
        setStep(2);
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Unable to save.");
      }
      return;
    }
    if (step === 2) {
      try {
        await savePatch({
          householdName,
          firstName,
          role,
          onboardingStep: 3
        });
        setStep(3);
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Unable to save.");
      }
      return;
    }
    if (step === 3) {
      try {
        await savePatch({
          nemoPersonality: personality,
          onboardingStep: 4
        });
        setStep(4);
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Unable to save.");
      }
      return;
    }
    if (step === 4) {
      try {
        await savePatch({
          groceryStoresNote,
          instagramNote,
          onboardingStep: 5
        });
        setStep(5);
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Unable to save.");
      }
      return;
    }
    if (step === 5) {
      try {
        await savePatch({
          fitnessGoal,
          onboardingStep: 6
        });
        setStep(6);
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Unable to save.");
      }
      return;
    }
    if (step === 6) {
      try {
        await savePatch({
          notifyChannel,
          weeklyPlanningDay,
          checkInTime,
          onboardingComplete: true,
          onboardingStep: 6
        });
        router.replace("/dashboard");
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Unable to finish onboarding.");
      }
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-forest-muted">Loading onboarding…</div>
    );
  }

  return (
    <div className="page-fade-in mx-auto max-w-3xl space-y-8">
      <div className="flex min-h-[40px] items-start">
        {step > 1 ? <PageBackButton onClick={handleBack} disabled={pending} /> : null}
      </div>

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-tan">Onboarding</p>
        <h1 className="font-display text-3xl text-forest">Shape your household experience</h1>
        <p className="text-sm text-forest-muted">
          Inspired by the six-screen flow in the product spec — conversational, low friction, everything optional beyond
          basics.
        </p>
        <div className="h-2 rounded-full bg-border">
          <div className="h-full rounded-full bg-fern transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {saveError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {saveError}
        </p>
      ) : null}

      <form className="space-y-8 rounded-3xl border border-border bg-white p-8 shadow-sm shadow-black/5" onSubmit={handleNext}>
        {step === 1 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-forest">Welcome</h2>
            <p className="text-sm text-forest-muted">
              You already authenticated — this mirror’s the doc’s welcome beat before Google SSO ships.
            </p>
            <div className="rounded-2xl bg-stone-bg p-4 text-sm text-forest-muted">
              AI disclosure: Nemo is powered by AI. This is not medical advice. Always consult a professional for health
              concerns.
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-forest">Household setup</h2>
            <label className="block text-sm text-forest-muted">
              Household name
              <input
                className="mt-2 w-full rounded-2xl border border-border bg-stone-bg px-4 py-3 text-forest outline-none ring-fern focus:ring-2"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="The Edmundowicz Family"
                required
              />
            </label>
            <label className="block text-sm text-forest-muted">
              First name only
              <input
                className="mt-2 w-full rounded-2xl border border-border bg-stone-bg px-4 py-3 text-forest outline-none ring-fern focus:ring-2"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ryan"
                required
              />
              <span className="mt-2 block text-xs text-tan">First name is all we need — no last names here.</span>
            </label>
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-forest">Role</legend>
              <label className="flex items-center gap-3 text-sm text-forest-muted">
                <input
                  type="radio"
                  name="role"
                  checked={role === "MEAL_PLANNER"}
                  onChange={() => setRole("MEAL_PLANNER")}
                />
                Meal planner — full household access
              </label>
              <label className="flex items-center gap-3 text-sm text-forest-muted">
                <input
                  type="radio"
                  name="role"
                  checked={role === "CONTRIBUTOR"}
                  onChange={() => setRole("CONTRIBUTOR")}
                />
                Contributor — recipes & ideas
              </label>
            </fieldset>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-forest">Meet Nemo</h2>
            <p className="text-sm text-forest-muted">
              Pick the tone that fits — each card includes a real sample line from the spec’s guidance.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {PERSONALITIES.map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => setPersonality(mode.id)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                    personality === mode.id ? "border-forest bg-stone-bg" : "border-border bg-white hover:border-tan"
                  }`}
                >
                  <p className="font-semibold text-forest">{mode.title}</p>
                  <p className="mt-2 text-xs text-forest-muted">{mode.sample}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-forest">Grocery & Instagram</h2>
            <p className="text-sm text-forest-muted">
              Instacart OAuth arrives later — capture context now. Instagram stays URL/DM friendly without forced login.
            </p>
            <label className="block text-sm text-forest-muted">
              Preferred stores / notes
              <textarea
                className="mt-2 min-h-[96px] w-full rounded-2xl border border-border bg-stone-bg px-4 py-3 text-forest outline-none ring-fern focus:ring-2"
                value={groceryStoresNote}
                onChange={(e) => setGroceryStoresNote(e.target.value)}
                placeholder="Whole Foods Westlake, Sunday farmers market…"
              />
            </label>
            <label className="block text-sm text-forest-muted">
              Instagram saves
              <textarea
                className="mt-2 min-h-[96px] w-full rounded-2xl border border-border bg-stone-bg px-4 py-3 text-forest outline-none ring-fern focus:ring-2"
                value={instagramNote}
                onChange={(e) => setInstagramNote(e.target.value)}
                placeholder="Paste URLs or describe how you save meals from @imaginalnutrition."
              />
            </label>
          </section>
        )}

        {step === 5 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-forest">Fitness & goals</h2>
            <p className="text-sm text-forest-muted">
              Everything here is voluntary — share only what you are comfortable with. Detailed metrics land in the coach
              chat later.
            </p>
            <label className="block text-sm text-forest-muted">
              Goal in your words
              <textarea
                className="mt-2 min-h-[120px] w-full rounded-2xl border border-border bg-stone-bg px-4 py-3 text-forest outline-none ring-fern focus:ring-2"
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                placeholder="Strength 3x/week, gentle fat loss, more fiber…"
              />
            </label>
          </section>
        )}

        {step === 6 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-forest">Notifications</h2>
            <p className="text-sm text-forest-muted">
              SMS/WhatsApp route through the Twilio stub (console logs) until keys are wired.
            </p>
            <label className="block text-sm text-forest-muted">
              Channel
              <select
                className="mt-2 w-full rounded-2xl border border-border bg-stone-bg px-4 py-3 text-forest outline-none ring-fern focus:ring-2"
                value={notifyChannel}
                onChange={(e) => setNotifyChannel(e.target.value as typeof notifyChannel)}
              >
                <option value="in_app">In-app</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-forest-muted">
                Weekly planning day
                <select
                  className="mt-2 w-full rounded-2xl border border-border bg-stone-bg px-4 py-3 text-forest outline-none ring-fern focus:ring-2"
                  value={weeklyPlanningDay}
                  onChange={(e) => setWeeklyPlanningDay(e.target.value as typeof weeklyPlanningDay)}
                >
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </label>
              <label className="block text-sm text-forest-muted">
                Check-in time
                <input
                  type="time"
                  className="mt-2 w-full rounded-2xl border border-border bg-stone-bg px-4 py-3 text-forest outline-none ring-fern focus:ring-2"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                />
              </label>
            </div>
          </section>
        )}

        <div className="flex flex-wrap items-center justify-end gap-4 border-t border-border pt-6">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-forest px-8 py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Saving…" : step === 6 ? "Finish" : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
