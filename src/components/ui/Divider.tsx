import { cn } from "@/utils/cn";

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
      <span className="size-1.5 rounded-full bg-brand/60" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-ash to-ash" />
    </div>
  );
}
