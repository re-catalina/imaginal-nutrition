"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/setup", label: "Calorie setup" },
  { href: "/nemo", label: "Nemo" },
  { href: "/plan", label: "Weekly plan" },
  { href: "/log", label: "Food log" },
  { href: "/grocery", label: "Grocery" },
  { href: "/recipes", label: "Recipes" },
  { href: "/settings", label: "Settings" }
] as const;

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-stone-bg text-forest font-sans">
      <header className="sticky top-0 z-40 border-b border-border bg-stone-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4">
          <Link href="/dashboard" className="font-display text-2xl tracking-tight text-forest">
            imaginal<span className="text-amber">.</span>
          </Link>
          <nav className="flex flex-1 flex-wrap gap-2 text-sm">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 transition-colors ${
                    active ? "bg-forest text-cream" : "text-forest-muted hover:bg-border/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full border border-border px-4 py-1.5 text-sm text-forest-muted hover:border-forest hover:text-forest"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
