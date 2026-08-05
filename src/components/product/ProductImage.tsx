import Image from "next/image";
import { Shirt } from "lucide-react";

type ProductImageProps = {
  imageUrl: string;
  alt: string;
};

export default function ProductImage({ imageUrl, alt }: ProductImageProps) {
  if (!imageUrl) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-ash bg-coal text-mist">
        <Shirt className="size-12" aria-hidden="true" />
        <span className="sr-only">Imagem do produto indisponível</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-ash bg-coal">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}
