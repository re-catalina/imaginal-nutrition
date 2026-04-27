"use client";

import { FormEvent, useMemo, useState } from "react";

type ChatTurn = {
  role: "user" | "assistant";
  text: string;
};

export default function NemoChatPage() {
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatTurn[]>([
    {
      role: "assistant",
      text: "Hey — I’m Nemo. Ask me anything about meals, macros, habits, or planning. Off-topic requests get a gentle redirect."
    }
  ]);

  const remainingCalories = useMemo(() => 650, []);
  const proteinConsumed = useMemo(() => 85, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) {
      return;
    }
    setPending(true);
    setError(null);
    const prompt = question.trim();
    setQuestion("");
    setChat((prev) => [...prev, { role: "user", text: prompt }]);

    try {
      const response = await fetch("/api/coach/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: prompt,
          remainingCalories,
          proteinConsumed
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to reach Nemo.");
      }
      setChat((prev) => [...prev, { role: "assistant", text: data.response as string }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="page-fade-in grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="flex flex-col rounded-3xl border border-border bg-white p-6 shadow-sm shadow-black/5">
        <header className="mb-4 border-b border-border pb-4">
          <p className="text-xs uppercase tracking-[0.3em] text-tan">Nemo</p>
          <h1 className="font-display text-3xl text-forest">Coach chat</h1>
          <p className="mt-2 text-sm text-forest-muted">
            Deterministic coaching stub today — swap the handler for Claude with the same scope guardrails from the design
            doc.
          </p>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {chat.map((turn, idx) => (
            <article
              key={`${turn.role}-${idx}`}
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                turn.role === "user" ? "ml-auto max-w-[80%] bg-forest text-cream" : "max-w-[90%] bg-stone-bg text-forest"
              }`}
            >
              {turn.text}
            </article>
          ))}
          {pending && (
            <div className="flex items-center gap-2 text-sm text-forest-muted">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-fern [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-fern [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-fern" />
              </span>
              Nemo is thinking…
            </div>
          )}
        </div>

        <form className="mt-6 space-y-3 border-t border-border pt-4" onSubmit={onSubmit}>
          <label className="block text-xs font-semibold uppercase tracking-wide text-forest-muted">
            Message
            <textarea
              className="field-input mt-2 min-h-[96px]"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Example: How should I recover protein tonight after a lighter lunch?"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-forest py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            Send to Nemo
          </button>
        </form>
      </section>

      <aside className="space-y-4 rounded-3xl border border-border bg-stone-bg/70 p-6 text-sm text-forest-muted">
        <p className="font-semibold text-forest">Context preview</p>
        <p>
          Today’s calorie placeholder used in API calls:{" "}
          <span className="font-mono text-forest">{remainingCalories}</span> kcal remaining.
        </p>
        <p>
          Protein logged placeholder: <span className="font-mono text-forest">{proteinConsumed} g</span>
        </p>
        <p>
          Hook these to `/api/targets/today` when you wire live summaries — structure matches the coaching route’s contract.
        </p>
      </aside>
    </div>
  );
}
