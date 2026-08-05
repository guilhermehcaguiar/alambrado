import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant?: "green" | "neutral" | "solid" | "promo";
  category?: "torcedor" | "jogador" | "retro" | "infantil";
  className?: string;
};

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  green: "border-brand/60 text-brand",
  neutral: "border-mist/30 text-mist",
  solid: "border-transparent bg-brand text-ink",
  promo: "border-transparent bg-amber-400 text-ink",
};

const categoryClasses: Record<NonNullable<BadgeProps["category"]>, string> = {
  torcedor: "border-transparent bg-brand text-ink",
  jogador: "border-red-400/60 text-red-300",
  retro: "border-yellow-300/60 text-yellow-300",
  infantil: "border-sky-400/60 text-sky-300",
};

export default function Badge({
  children,
  variant = "neutral",
  category,
  className = "",
}: BadgeProps) {
  const color = category ? categoryClasses[category] : variantClasses[variant];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-body text-xs font-semibold uppercase tracking-wider ${color} ${className}`}
    >
      {children}
    </span>
  );
}
