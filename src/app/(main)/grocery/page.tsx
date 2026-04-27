"use client";

import { useState } from "react";
import { toast } from "sonner";

const SECTIONS = [
  {
    name: "Produce",
    items: [
      { label: "Broccoli crowns", qty: "2" },
      { label: "Blueberries", qty: "1 pint" }
    ]
  },
  {
    name: "Protein",
    items: [
      { label: "Salmon fillets", qty: "1.5 lb" },
      { label: "Greek yogurt", qty: "2 tubs" }
    ]
  },
  {
    name: "Pantry",
    items: [
      { label: "Olive oil", qty: "1 bottle" },
      { label: "Rolled oats", qty: "1 canister" }
    ]
  }
];

export default function GroceryPage() {
  const [pending, setPending] = useState(false);

  async function orderOnInstacart() {
    setPending(true);
    try {
      const response = await fetch("/api/grocery/instacart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "Weekly plan cart", itemCount: 12 })
      });
      if (!response.ok) {
        throw new Error("Request failed");
      }
      toast.success("Instacart order prepared", {
        description: "Stub only — no network call yet. Hook the Instacart Developer API in /api/grocery/instacart."
      });
    } catch {
      toast.error("Could not trigger Instacart stub.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="page-fade-in space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-tan">Pantry logistics</p>
          <h1 className="font-display text-3xl text-forest">Grocery list</h1>
          <p className="mt-2 max-w-3xl text-sm text-forest-muted">
            Sections follow the design doc ordering. Quantities adapt to household size once the meal plan service writes into
            `GroceryList`.
          </p>
        </div>
        <button
          type="button"
          onClick={orderOnInstacart}
          disabled={pending}
          className="rounded-full bg-amber px-6 py-3 text-sm font-semibold text-night transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Preparing…" : "Order on Instacart"}
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {SECTIONS.map((section) => (
          <div key={section.name} className="rounded-3xl border border-border bg-white p-6 shadow-sm shadow-black/5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-tan">{section.name}</p>
            <ul className="mt-4 space-y-3 text-sm text-forest">
              {section.items.map((item) => (
                <li key={item.label} className="flex justify-between gap-4 border-b border-border/70 pb-3 last:border-none last:pb-0">
                  <span>{item.label}</span>
                  <span className="font-mono text-xs text-forest-muted">{item.qty}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
