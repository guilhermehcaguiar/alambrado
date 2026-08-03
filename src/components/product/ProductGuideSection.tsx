import Image from "next/image";
import { Truck, ShieldCheck, BadgeCheck, Sparkles } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const IMPORTANT_INFO = [
  { icon: Truck, label: "Entrega", value: "20 a 30 dias úteis" },
  { icon: ShieldCheck, label: "Qualidade", value: "Tailandesa 1:1" },
  { icon: BadgeCheck, label: "Patch", value: "Em breve" },
  { icon: Sparkles, label: "Personalização", value: "Em breve" },
] as const;

export default function ProductGuideSection() {
  return (
    <section className="mt-16 space-y-12" aria-label="Informações e cuidados">
      <div>
        <SectionHeading
          eyebrow="Detalhes"
          title="Informações Importantes"
        />
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {IMPORTANT_INFO.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-4 rounded-xl border border-ash bg-graphite px-5 py-4 transition-colors duration-200 hover:border-brand/60"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-body text-sm font-semibold text-paper">{item.label}</p>
                <p className="font-body text-sm text-mist">{item.value}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <SectionHeading eyebrow="Guia" title="Medidas e Cuidados" />
        <div className="relative mt-6 aspect-square w-full max-w-3xl overflow-hidden rounded-xl border border-ash bg-paper">
          <Image
            src="/guide/medidas-cuidados.png"
            alt="Tabela de medidas e cuidados com a camisa ALAMBRADO"
            fill
            className="object-contain"
            sizes="(min-width: 768px) 48rem, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
