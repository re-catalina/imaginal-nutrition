import Link from "next/link";
import type { ComponentProps } from "react";

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type PageBackButtonProps = {
  href?: ComponentProps<typeof Link>["href"];
  label?: string;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
};

/**
 * Top-leading back control for onboarding steps and drill-down surfaces.
 */
export function PageBackButton({ href, label = "Back", onClick, disabled }: PageBackButtonProps) {
  const className =
    "inline-flex items-center gap-1.5 rounded-xl px-1 py-2 text-sm font-semibold text-forest-muted transition-colors hover:text-forest disabled:pointer-events-none disabled:opacity-40";

  if (href) {
    return (
      <Link href={href} className={className}>
        <ChevronLeftIcon />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={() => void onClick?.()} disabled={disabled}>
      <ChevronLeftIcon />
      {label}
    </button>
  );
}
