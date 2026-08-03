import type { Metadata } from "next";
import Link from "next/link";
import { Headset, MapPin, Truck } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import PageHeader from "@/components/ui/PageHeader";
import Logo from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a ALAMBRADO. Atendimento pelo WhatsApp durante o checkout, em Recife/PE. Pedidos entregues em 20 a 30 dias úteis.",
  alternates: {
    canonical: "/contato",
  },
};

const CHANNELS = [
  {
    icon: Headset,
    title: "Atendimento pelo WhatsApp",
    text: "O atendimento é feito pelo WhatsApp. Ao finalizar o pedido no carrinho, a mensagem é preparada automaticamente para você.",
  },
  {
    icon: MapPin,
    title: "Onde estamos",
    text: "Recife, Pernambuco · Brasil. Enviamos para todo o país.",
  },
  {
    icon: Truck,
    title: "Prazo de entrega",
    text: "Produção sob demanda e envio em 20 a 30 dias úteis.",
  },
] as const;

export default function ContatoPage() {
  return (
    <Container>
      <Section className="space-y-10">
        <PageHeader
          eyebrow="Contato"
          title="Fale com a ALAMBRADO"
          description="Dúvidas sobre medidas, pedidos ou prazos? O nosso atendimento é próximo e direto pelo WhatsApp. Adicione os produtos ao carrinho e finalize o pedido para iniciar a conversa."
        />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHANNELS.map((channel) => (
            <li
              key={channel.title}
              className="flex flex-col gap-4 rounded-xl border border-ash bg-graphite p-6 transition-colors duration-200 hover:border-brand/60"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
                <channel.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="font-subtitle text-base font-semibold uppercase tracking-wide text-paper">
                {channel.title}
              </p>
              <p className="font-body text-sm leading-relaxed text-mist">
                {channel.text}
              </p>
            </li>
          ))}
        </ul>

        <div className="relative flex flex-col items-start gap-4 overflow-hidden rounded-xl border border-ash bg-graphite p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="absolute inset-0 bg-fence opacity-30" aria-hidden="true" />
          <div className="relative">
            <Logo className="h-8 w-auto" />
            <h2 className="mt-3 font-subtitle text-xl font-semibold uppercase tracking-wider text-paper">
              Começar um pedido
            </h2>
            <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-mist">
              Escolha sua camisa no catálogo e adicione ao carrinho para finalizar pelo
              WhatsApp.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="relative inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-8 py-4 font-body text-base font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Ver catálogo
          </Link>
        </div>
      </Section>
    </Container>
  );
}
