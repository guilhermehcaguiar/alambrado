import { cn } from "@/utils/cn";
import Badge from "@/components/ui/Badge";

type PageHeaderProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  className?: string;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {eyebrow ? <Badge variant="green">{eyebrow}</Badge> : null}
      <h1 className="font-display text-4xl uppercase leading-none tracking-wide text-paper sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl font-body text-base leading-relaxed text-mist">
          {description}
        </p>
      ) : null}
    </div>
  );
}
