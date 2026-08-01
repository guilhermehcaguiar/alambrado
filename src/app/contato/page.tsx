import type { Metadata } from "next";
import PlaceholderPage from "@/components/common/PlaceholderPage";

export const metadata: Metadata = {
  title: "Contato",
};

export default function ContatoPage() {
  return (
    <PlaceholderPage
      title="Contato"
      description="O atendimento será realizado pelo WhatsApp. As informações de contato serão publicadas aqui."
    />
  );
}
