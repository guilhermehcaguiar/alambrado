import { cn } from "@/utils/cn";

type SectionHeadingProps = {
  title: React.ReactNode;
  eyebrow?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeading({
  title,
  eyebrow,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        centered && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-widest text-brand">
          <span className="h-0.5 w-8 bg-brand" aria-hidden="true" />
          {eyebrow}
          {centered ? <span className="h-0.5 w-8 bg-brand" aria-hidden="true" /> : null}
        </span>
      ) : (
        <span className="h-0.5 w-10 bg-brand" aria-hidden="true" />
      )}
      <h2 className="font-display text-3xl uppercase leading-none tracking-wide text-paper sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl font-body text-base leading-relaxed text-mist">
          {description}
        </p>
      ) : null}
    </div>
  );
}
