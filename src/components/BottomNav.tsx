"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/plan", label: "Plan", icon: PlanIcon },
  { href: "/log", label: "Log", icon: LogIcon },
  { href: "/nemo", label: "Nemo", icon: NemoIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon }
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-stone-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-t-xl px-2 py-2 text-[10px] font-medium transition-colors sm:text-xs ${
                active ? "text-forest" : "text-forest-muted hover:text-forest"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  active ? "bg-forest text-cream" : "bg-border/50 text-forest"
                }`}
              >
                <Icon active={active} />
              </span>
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className={active ? "text-cream" : "text-forest"}>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlanIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className={active ? "text-cream" : "text-forest"}>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 9h16M9 5v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LogIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className={active ? "text-cream" : "text-forest"}>
      <path
        d="M8 5h12v14H8l-4-3V8l4-3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M11 10h6M11 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function NemoIcon({ active }: { active: boolean }) {
  return (
    <span
      className={`font-display text-lg leading-none ${active ? "text-cream" : "text-forest"}`}
      aria-hidden
    >
      N
    </span>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className={active ? "text-cream" : "text-forest"}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
