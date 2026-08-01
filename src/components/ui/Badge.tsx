import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant?: "green" | "neutral";
  className?: string;
};

export default function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variantClasses =
    variant === "green"
      ? "border-brand/60 text-brand"
      : "border-mist/30 text-mist";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-body text-xs font-semibold uppercase tracking-wider ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
}
