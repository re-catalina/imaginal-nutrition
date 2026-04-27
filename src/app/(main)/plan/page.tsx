const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeeklyPlanPage() {
  return (
    <div className="page-fade-in space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-tan">Weekly rhythm</p>
        <h1 className="font-display text-3xl text-forest">Household meal plan</h1>
        <p className="mt-2 max-w-3xl text-sm text-forest-muted">
          Planning session UI — mirrors the Saturday/Sunday check-in + builder described in the spec. Generation hooks to Claude
          land server-side later; this grid is ready for swap interactions.
        </p>
      </header>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm shadow-black/5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-forest">Week of April 21</p>
            <p className="text-xs text-forest-muted">Tap a day to expand slots — iPad split view will pin Nemo on the left.</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-amber px-5 py-2 text-sm font-semibold text-night opacity-70"
            disabled
          >
            Generate with Nemo (soon)
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          {DAYS.map((day) => (
            <div key={day} className="flex flex-col gap-3 rounded-2xl border border-border bg-stone-bg/80 p-4">
              <p className="text-center text-sm font-semibold text-forest">{day}</p>
              <MealSlot label="Breakfast" placeholder="Overnight oats" />
              <MealSlot label="Lunch" placeholder="Grain bowl" />
              <MealSlot label="Dinner" placeholder="Sheet-pan salmon" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MealSlot({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-white px-3 py-2 text-xs text-forest-muted">
      <p className="font-semibold text-forest">{label}</p>
      <p className="mt-1 text-[11px]">{placeholder}</p>
    </div>
  );
}
