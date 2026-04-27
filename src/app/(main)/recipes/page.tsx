"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type FolderPreview = { id: string; name: string; color: string | null };

type Recipe = {
  id: string;
  title: string;
  servings: number;
  fromInstagram: boolean;
  folderItems?: { folder: FolderPreview }[];
};

function folderSummary(recipe: Recipe): string {
  const first = recipe.folderItems?.[0]?.folder?.name;
  return first ?? "Library";
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [title, setTitle] = useState("Blueberry lime overnight oats");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/recipes");
    if (!response.ok) {
      setRecipes([]);
      return;
    }
    const data = await response.json();
    setRecipes(data.recipes ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createRecipe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const ingredients = [
      { name: "Rolled oats", amount: "1 cup" },
      { name: "Milk", amount: "1 cup" },
      { name: "Blueberries", amount: "1/2 cup" }
    ];
    const fromIg = Boolean(instagramUrl.trim());
    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        servings: 4,
        ingredients,
        fromInstagram: fromIg,
        sourceUrl: fromIg ? instagramUrl.trim() : undefined,
        folderName: fromIg ? undefined : "Staples"
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data?.error ?? "Unable to save recipe.");
      return;
    }
    setMessage("Recipe saved.");
    setInstagramUrl("");
    await load();
  }

  return (
    <div className="page-fade-in space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-tan">Recipe library</p>
        <h1 className="font-display text-3xl text-forest">Household favorites</h1>
        <p className="mt-2 max-w-3xl text-sm text-forest-muted">
          Folders are relational (`RecipeFolder` / `RecipeFolderItem`). Staples vs Instagram routing happens server-side when you
          save.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {recipes.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-border bg-white p-8 text-sm text-forest-muted">
              No recipes yet — create one on the right after onboarding establishes a household.
            </p>
          ) : (
            <ul className="space-y-4">
              {recipes.map((recipe) => (
                <li key={recipe.id}>
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="card-hover flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-white p-5 shadow-sm shadow-black/5 transition-transform duration-ui hover:-translate-y-0.5"
                  >
                    <div>
                      <p className="text-lg font-semibold text-forest">{recipe.title}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-tan">
                        {folderSummary(recipe)} · serves {recipe.servings}
                      </p>
                    </div>
                    {recipe.fromInstagram ? (
                      <span className="rounded-full bg-stone-bg px-3 py-1 text-xs font-semibold text-forest">Instagram</span>
                    ) : (
                      <span className="text-xs font-semibold text-tan">View →</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form className="space-y-4 rounded-3xl border border-border bg-stone-bg/80 p-6" onSubmit={createRecipe}>
          <h2 className="text-lg font-semibold text-forest">Save a recipe</h2>
          <label className="text-sm text-forest-muted">
            Title
            <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="text-sm text-forest-muted">
            Instagram URL (optional)
            <input
              className="field-input"
              placeholder="https://www.instagram.com/p/..."
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
            />
          </label>
          <button type="submit" className="w-full rounded-full bg-forest py-3 text-sm font-semibold text-cream">
            Save to library
          </button>
          {message && <p className="text-sm text-fern">{message}</p>}
        </form>
      </section>
    </div>
  );
}
