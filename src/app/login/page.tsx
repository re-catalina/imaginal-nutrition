"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await signIn("credentials", {
      redirect: false,
      username,
      password
    });
    setPending(false);
    if (result?.error) {
      setError("Those credentials did not match our records.");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen bg-night text-cream">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link href="/" className="mb-8 text-center font-display text-3xl text-cream">
          imaginal<span className="text-amber">.</span>
        </Link>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-8 backdrop-blur-sm">
          <h1 className="mb-6 text-xl font-semibold text-cream">Sign in</h1>
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm text-cream/80">
              Username
              <input
                className="mt-2 w-full rounded-xl border border-white/15 bg-night px-4 py-3 text-cream outline-none ring-fern focus:ring-2"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ryan"
                required
              />
            </label>
            <label className="block text-sm text-cream/80">
              Password
              <input
                type="password"
                className="mt-2 w-full rounded-xl border border-white/15 bg-night px-4 py-3 text-cream outline-none ring-fern focus:ring-2"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-amber py-3 text-sm font-semibold text-night transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Continue"}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-cream/60">
            Use the beta account from your environment notes (default: ryan / test123).
          </p>
        </div>
      </div>
    </div>
  );
}
