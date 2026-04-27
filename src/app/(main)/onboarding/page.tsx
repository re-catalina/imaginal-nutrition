"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);

  const [householdName, setHouseholdName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [role, setRole] = useState<"MEAL_PLANNER" | "CONTRIBUTOR">("MEAL_PLANNER");
  const [personality, setPersonality] = useState(PERSONALITIES[0].id);
  const [groceryStoresNote, setGroceryStoresNote] = useState("");
  const [instagramNote, setInstagramNote] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [notifyChannel, setNotifyChannel] = useState<"in_app" | "sms" | "whatsapp">("in_app");
  const [weeklyPlanningDay, setWeeklyPlanningDay] = useState<"friday" | "saturday" | "sunday">("sunday");
  const [checkInTime, setCheckInTime] = useState("09:00");

  const progress = useMemo(() => Math.round((step / 6) * 100), [step]);

  async function savePatch(data: Record<string, unknown>) {
    setPending(true);
    try {
      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error("Unable to save.");
      }
    } finally {
      setPending(false);
    }
  }

  async function handleNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) {
      await savePatch({ onboardingStep: 2 });
      setStep(2);
      return;
    }
    if (step === 2) {
      await savePatch({
        householdName,
        firstName,
        role,
        onboardingStep: 3
      });
      setStep(3);
      return;
    }
    if (step === 3) {
      await savePatch({
        nemoPersonality: personality,
        onboardingStep: 4
      });
      setStep(4);
      return;
    }
    if (step === 4) {
      await savePatch({
        groceryStoresNote,
        instagramNote,
        onboardingStep: 5
      });
      setStep(5);
      return;
    }
    if (step === 5) {
      await savePatch({
        fitnessGoal,
        onboardingStep: 6
      });
      setStep(6);
      return;
    }
    if (step === 6) {
      await savePatch({
        notifyChannel,
        weeklyPlanningDay,
        checkInTime,
        onboardingComplete: true,
        onboardingStep: 6
      });
      router.push("/dashboard");
    }
  }

  return (
    <div className="page-fade-in mx-auto max-w-3xl space-y-8">
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

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <button
            type="button"
            className="text-sm font-semibold text-forest-muted hover:text-forest"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1 || pending}
          >
            Back
          </button>
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
