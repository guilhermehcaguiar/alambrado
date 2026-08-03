import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Carrinho",
  robots: { index: false, follow: false },
};

export default function CarrinhoPage() {
  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-display text-4xl uppercase tracking-wide text-paper sm:text-5xl">
        Seu carrinho
      </h1>
      <div className="mt-8">
        <CartView />
      </div>
    </Container>
  );
}
