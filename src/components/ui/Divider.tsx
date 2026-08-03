import { cn } from "@/utils/cn";
import Logo from "@/components/brand/Logo";

type DividerProps = {
  className?: string;
};

export default function Divider({ className }: DividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-center justify-center gap-4 py-2", className)}
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-ash to-ash" />
      <Logo className="h-6 w-auto opacity-60" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-ash to-ash" />
    </div>
  );
}
