import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Carrinho",
  robots: { index: false, follow: false },
};

export default function CarrinhoPage() {
  return (
    <Container className="py-8 sm:py-12">
      <PageHeader
        eyebrow="Pedido"
        title="Seu carrinho"
        description="Revise os itens, escolha os tamanhos e finalize pelo WhatsApp."
      />
      <div className="mt-8">
        <CartView />
      </div>
    </Container>
  );
}
