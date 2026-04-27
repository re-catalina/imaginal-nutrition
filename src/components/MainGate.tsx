"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function isOnboardingPath(pathname: string) {
  return pathname === "/onboarding" || pathname.startsWith("/onboarding/");
}

/**
 * Ensures incomplete users stay on onboarding and completed users skip it on load.
 */
export function MainGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          if (!cancelled) setInitialized(true);
          return;
        }
        const me = (await res.json()) as { onboardingComplete?: boolean };
        if (cancelled) return;

        const complete = Boolean(me.onboardingComplete);
        const onOnboarding = isOnboardingPath(pathname);

        if (complete && onOnboarding) {
          router.replace("/dashboard");
          return;
        }
        if (!complete && !onOnboarding) {
          router.replace("/onboarding");
          return;
        }
      } catch {
        // allow shell to render; APIs may still enforce
      }
      if (!cancelled) setInitialized(true);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!initialized) {
    return (
      <div className="flex min-h-[45vh] flex-col items-center justify-center gap-3 text-sm text-forest-muted">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-forest" aria-hidden />
        <span>Loading your profile…</span>
      </div>
    );
  }

  return <>{children}</>;
}
