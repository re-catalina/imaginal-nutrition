"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

import { BottomNav } from "@/components/BottomNav";
import { MainGate } from "@/components/MainGate";

export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-stone-bg text-forest font-sans">
      <header className="sticky top-0 z-40 border-b border-border bg-stone-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="font-display text-2xl tracking-tight text-forest">
            imaginal<span className="text-amber">.</span>
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full border border-border px-4 py-1.5 text-sm text-forest-muted hover:border-forest hover:text-forest"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6">
        <MainGate>{children}</MainGate>
      </main>
      <BottomNav />
    </div>
  );
}
