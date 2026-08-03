import type { Metadata } from "next";
import Link from "next/link";
import { Headset, MapPin, Truck } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";

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
        <div>
          <Badge variant="green">Contato</Badge>
          <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-paper sm:text-5xl">
            Fale com a ALAMBRADO
          </h1>
          <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-mist">
            Dúvidas sobre medidas, pedidos ou prazos? O nosso atendimento é próximo e
            direto pelo WhatsApp. Adicione os produtos ao carrinho e finalize o pedido
            para iniciar a conversa.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHANNELS.map((channel) => (
            <li
              key={channel.title}
              className="flex flex-col gap-4 rounded-xl border border-ash bg-graphite p-6"
            >
              <channel.icon className="size-6 shrink-0 text-brand" aria-hidden="true" />
              <p className="font-subtitle text-base font-semibold uppercase tracking-wide text-paper">
                {channel.title}
              </p>
              <p className="font-body text-sm leading-relaxed text-mist">
                {channel.text}
              </p>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-start gap-4 rounded-xl border border-ash bg-graphite p-8">
          <h2 className="font-subtitle text-xl font-semibold uppercase tracking-wider text-paper">
            Começar um pedido
          </h2>
          <p className="max-w-xl font-body text-sm leading-relaxed text-mist">
            Escolha sua camisa no catálogo e adicione ao carrinho para finalizar pelo
            WhatsApp.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-8 py-4 font-body text-base font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Ver catálogo
          </Link>
        </div>
      </Section>
    </Container>
  );
}
