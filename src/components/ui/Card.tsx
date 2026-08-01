import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl border border-ash bg-graphite p-5 ${className}`}>
      {children}
    </div>
  );
}
