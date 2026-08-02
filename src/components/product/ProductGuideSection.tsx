import Image from "next/image";
import { Truck, ShieldCheck, BadgeCheck, Sparkles } from "lucide-react";

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
        <h2 className="font-subtitle text-2xl font-semibold uppercase tracking-wider text-paper">
          Informações Importantes
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {IMPORTANT_INFO.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-4 rounded-xl border border-ash bg-graphite px-5 py-4"
            >
              <item.icon className="size-6 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="font-body text-sm font-semibold text-paper">{item.label}</p>
                <p className="font-body text-sm text-mist">{item.value}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-subtitle text-2xl font-semibold uppercase tracking-wider text-paper">
          Medidas e Cuidados
        </h3>
        <div className="relative mt-4 aspect-[3/4] w-full max-w-3xl overflow-hidden rounded-xl border border-ash bg-paper">
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
