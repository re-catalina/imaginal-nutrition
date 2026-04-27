"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { PageBackButton } from "@/components/PageBackButton";

type IngredientRow = { name: string; amount: string };

type RecipeDetail = {
  id: string;
  title: string;
  servings: number;
  ingredientsJson: unknown;
  instructions: string | null;
  sourceUrl: string | null;
  caloriesPerServ: number | null;
  proteinPerServ: number | null;
  carbsPerServ: number | null;
  fatPerServ: number | null;
};

function parseIngredients(raw: unknown): IngredientRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const name = "name" in row && typeof row.name === "string" ? row.name : "";
      const amount = "amount" in row && typeof row.amount === "string" ? row.amount : "";
      if (!name && !amount) return null;
      return { name, amount };
    })
    .filter((r): r is IngredientRow => r !== null);
}

export default function RecipeDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    if (!id) {
      setError("Invalid recipe.");
      return;
    }
    const res = await fetch(`/api/recipes/${id}`);
    if (!res.ok) {
      setRecipe(null);
      setError(res.status === 404 ? "Recipe not found." : "Unable to load recipe.");
      return;
    }
    const data = (await res.json()) as { recipe: RecipeDetail };
    setRecipe(data.recipe);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const ingredients = recipe ? parseIngredients(recipe.ingredientsJson) : [];

  return (
    <div className="page-fade-in mx-auto max-w-3xl space-y-8">
      <PageBackButton href="/recipes" />

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {!recipe && !error ? (
        <div className="flex min-h-[30vh] items-center justify-center text-sm text-forest-muted">Loading recipe…</div>
      ) : null}

      {recipe ? (
        <>
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-tan">Recipe</p>
            <h1 className="font-display text-3xl text-forest">{recipe.title}</h1>
            <p className="text-sm text-forest-muted">Serves {recipe.servings}</p>
            {recipe.sourceUrl ? (
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm font-semibold text-fern underline underline-offset-4"
              >
                Open source link
              </a>
            ) : null}
          </header>

          {(recipe.caloriesPerServ ?? recipe.proteinPerServ ?? recipe.carbsPerServ ?? recipe.fatPerServ) != null ? (
            <section className="rounded-3xl border border-border bg-white p-6 shadow-sm shadow-black/5">
              <p className="text-xs uppercase tracking-[0.2em] text-tan">Per serving</p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                {recipe.caloriesPerServ != null ? (
                  <div className="flex justify-between gap-4 rounded-2xl bg-stone-bg px-4 py-3">
                    <dt className="text-forest-muted">Calories</dt>
                    <dd className="font-mono text-forest">{recipe.caloriesPerServ}</dd>
                  </div>
                ) : null}
                {recipe.proteinPerServ != null ? (
                  <div className="flex justify-between gap-4 rounded-2xl bg-stone-bg px-4 py-3">
                    <dt className="text-forest-muted">Protein</dt>
                    <dd className="font-mono text-forest">{recipe.proteinPerServ} g</dd>
                  </div>
                ) : null}
                {recipe.carbsPerServ != null ? (
                  <div className="flex justify-between gap-4 rounded-2xl bg-stone-bg px-4 py-3">
                    <dt className="text-forest-muted">Carbs</dt>
                    <dd className="font-mono text-forest">{recipe.carbsPerServ} g</dd>
                  </div>
                ) : null}
                {recipe.fatPerServ != null ? (
                  <div className="flex justify-between gap-4 rounded-2xl bg-stone-bg px-4 py-3">
                    <dt className="text-forest-muted">Fat</dt>
                    <dd className="font-mono text-forest">{recipe.fatPerServ} g</dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          <section className="rounded-3xl border border-border bg-white p-6 shadow-sm shadow-black/5">
            <h2 className="text-lg font-semibold text-forest">Ingredients</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {ingredients.map((row, i) => (
                <li key={`${row.name}-${i}`} className="flex justify-between gap-4 border-b border-border/60 py-2 last:border-0">
                  <span className="text-forest">{row.name}</span>
                  <span className="font-mono text-forest-muted">{row.amount}</span>
                </li>
              ))}
            </ul>
          </section>

          {recipe.instructions?.trim() ? (
            <section className="rounded-3xl border border-border bg-white p-6 shadow-sm shadow-black/5">
              <h2 className="text-lg font-semibold text-forest">Instructions</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm text-forest-muted">{recipe.instructions}</p>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
