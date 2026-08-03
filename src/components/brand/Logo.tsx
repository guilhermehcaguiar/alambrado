import Image from "next/image";
import { cn } from "@/utils/cn";

type LogoProps = {
  className?: string;
  priority?: boolean;
};

export default function Logo({ className, priority = false }: LogoProps) {
  return (
    <Image
      src="/logo/vetor-alambrado-logo.webp"
      alt="ALAMBRADO"
      width={440}
      height={259}
      priority={priority}
      className={cn("h-auto w-auto", className)}
    />
  );
}
