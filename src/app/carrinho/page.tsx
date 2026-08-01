import type { Metadata } from "next";
import PlaceholderPage from "@/components/common/PlaceholderPage";

export const metadata: Metadata = {
  title: "Carrinho",
};

export default function CarrinhoPage() {
  return (
    <PlaceholderPage
      title="Carrinho"
      description="O carrinho funcionará no navegador com Context API e localStorage. Aqui o cliente revisa o pedido, informa o nome e finaliza a compra pelo WhatsApp."
    />
  );
}
