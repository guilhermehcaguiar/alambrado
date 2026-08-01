import Image from "next/image";
import { Truck, ShieldCheck, BadgeCheck, Sparkles } from "lucide-react";

const IMPORTANT_INFO = [
  { icon: Truck, label: "Entrega", value: "15 a 25 dias úteis" },
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
          Tabela de Medidas
        </h3>
        <div className="relative mt-4 aspect-[3/4] w-full max-w-3xl overflow-hidden rounded-xl border border-ash bg-paper">
          <Image
            src="/guide/medidas.jpeg"
            alt="Tabela de medidas da ALAMBRADO com as referências de tamanhos P, M, G, GG, XGG, 3XG e 4XG"
            fill
            className="object-contain"
            sizes="(min-width: 768px) 48rem, 100vw"
          />
        </div>
      </div>

      <div>
        <h3 className="font-subtitle text-2xl font-semibold uppercase tracking-wider text-paper">
          Cuidados com sua Camisa
        </h3>
        <div className="relative mt-4 aspect-[3/4] w-full max-w-3xl overflow-hidden rounded-xl border border-ash bg-paper">
          <Image
            src="/guide/cuidados.jpeg"
            alt="Cuidados com sua camisa ALAMBRADO: instruções de lavagem e conservação"
            fill
            className="object-contain"
            sizes="(min-width: 768px) 48rem, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
