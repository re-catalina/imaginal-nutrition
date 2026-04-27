"use client";

import { FormEvent, useState } from "react";

import { PageBackButton } from "@/components/PageBackButton";

export default function CalorieSetupPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      weightLbs: Number(form.get("weightLbs")),
      heightFeet: Number(form.get("heightFeet")),
      heightInches: Number(form.get("heightInches")),
      age: Number(form.get("age")),
      sex: String(form.get("sex")) as "male" | "female",
      activityLevel: String(form.get("activityLevel")),
      goalType: String(form.get("goalType"))
    };

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setMessage(typeof data?.error === "string" ? data.error : "Unable to save profile.");
      return;
    }
    setMessage(`Targets saved — goal intake ${data.targetCalories} kcal / day.`);
  }

  return (
    <div className="page-fade-in mx-auto max-w-3xl space-y-8">
      <PageBackButton href="/dashboard" />
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-tan">Energy budget</p>
        <h1 className="font-display text-3xl text-forest">Calorie & macro setup</h1>
        <p className="mt-2 text-sm text-forest-muted">
          Uses the existing deterministic engine from this codebase — aligns with Screen 5’s intake conversation before Nemo’s
          deeper coaching loop goes live.
        </p>
      </header>

      <form className="space-y-6 rounded-3xl border border-border bg-white p-8 shadow-sm shadow-black/5" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-forest-muted">
            Weight (lb)
            <input name="weightLbs" type="number" step="0.1" required className="field-input" placeholder="175" />
          </label>
          <label className="text-sm text-forest-muted">
            Age
            <input name="age" type="number" required className="field-input" placeholder="36" />
          </label>
          <label className="text-sm text-forest-muted">
            Height (ft)
            <input name="heightFeet" type="number" required className="field-input" placeholder="5" />
          </label>
          <label className="text-sm text-forest-muted">
            Height (in)
            <input name="heightInches" type="number" required className="field-input" placeholder="10" />
          </label>
        </div>
        <label className="text-sm text-forest-muted">
          Sex
          <select name="sex" className="field-input" defaultValue="male">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label className="text-sm text-forest-muted">
          Activity
          <select name="activityLevel" className="field-input" defaultValue="moderate">
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very Active</option>
          </select>
        </label>
        <label className="text-sm text-forest-muted">
          Goal
          <select name="goalType" className="field-input" defaultValue="fat_loss">
            <option value="fat_loss">Fat loss</option>
            <option value="maintenance">Maintenance</option>
            <option value="muscle_gain">Muscle gain</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-forest py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save targets"}
        </button>
        {message && <p className="text-sm text-fern">{message}</p>}
      </form>
    </div>
  );
}
