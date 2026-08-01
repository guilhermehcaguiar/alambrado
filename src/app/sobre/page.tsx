import type { Metadata } from "next";
import PlaceholderPage from "@/components/common/PlaceholderPage";

export const metadata: Metadata = {
  title: "Sobre",
};

export default function SobrePage() {
  return (
    <PlaceholderPage
      title="Sobre a ALAMBRADO"
      description="Camisas de futebol tailandesas 1:1 para quem vive o jogo. Futebol, confiança, qualidade, modernidade e desempenho."
    />
  );
}
