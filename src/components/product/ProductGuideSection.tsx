import Image from "next/image";

export default function ProductGuideSection() {
  return (
    <section className="mt-16 space-y-12" aria-label="Informações e cuidados">
      <div>
        <h2 className="font-subtitle text-2xl font-semibold uppercase tracking-wider text-paper">
          Informações Importantes
        </h2>
        <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-5 font-body text-sm leading-relaxed text-mist">
          <li>Produção em 15 a 25 dias úteis após a confirmação do pedido.</li>
          <li>Camisas versão Torcedor, fiel ao modelo original.</li>
          <li>Personalização e patch indisponíveis neste lançamento.</li>
          <li>Consulte a tabela de medidas antes de escolher o tamanho.</li>
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
