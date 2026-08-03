import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant?: "green" | "neutral" | "solid" | "promo";
  className?: string;
};

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  green: "border-brand/60 text-brand",
  neutral: "border-mist/30 text-mist",
  solid: "border-transparent bg-brand text-ink",
  promo: "border-transparent bg-amber-400 text-ink",
};

export default function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-body text-xs font-semibold uppercase tracking-wider ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
