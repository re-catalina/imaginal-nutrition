import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-night text-cream">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-16">
        <header className="space-y-4 text-center">
          <p className="font-display text-5xl text-cream sm:text-6xl">
            imaginal<span className="text-amber">.</span>
          </p>
          <p className="text-xs font-medium tracking-[0.35em] text-tan">N U T R I T I O N</p>
          <h1 className="text-balance text-2xl font-medium text-cream sm:text-3xl">
            Your personal coach for real, lasting change.
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-sm leading-relaxed text-cream/80">
            Imaginal Nutrition helps households eat well together — weekly planning, food logging, grocery lists, and Nemo,
            your scoped nutrition coach powered by AI.
          </p>
        </header>

        <div className="flex flex-col items-center gap-4">
          <Link
            href="/login"
            className="inline-flex min-w-[220px] justify-center rounded-full bg-amber px-8 py-3 text-sm font-semibold text-night transition-opacity hover:opacity-90"
          >
            Sign in
          </Link>
          <p className="text-xs text-cream/60">
            Beta uses a shared test account. Google sign-in arrives later — the auth layer is ready for it.
          </p>
        </div>

        <footer className="border-t border-white/10 pt-8 text-center text-xs text-cream/50">
          Informational wellness coaching only — not medical advice.
        </footer>
      </div>
    </div>
  );
}
