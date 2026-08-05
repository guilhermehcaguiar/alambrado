"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import CartQuantityControl from "@/components/cart/CartQuantityControl";
import ProductPrice from "@/components/product/ProductPrice";
import ProductSelector from "@/components/product/ProductSelector";
import { computePriceForSize, getPromoUnitPrice, getSizeSurcharge } from "@/config/prices";
import { useCart } from "@/hooks/useCart";
import { MAX_CART_ITEM_QUANTITY, type CartItem } from "@/types/cart";
import { CATEGORY_LABELS, isPromoStarted, type Product, type ProductSize } from "@/types/product";
import { computeUnitPrice, createCartItemId, getCategoryQuantities } from "@/utils/cart";
import { formatBRL, formatDate } from "@/utils/format";

type ProductPurchaseProps = {
  product: Product;
};

export default function ProductPurchase({ product }: ProductPurchaseProps) {
  const { addItem, items } = useCart();
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const surcharge = selectedSize ? getSizeSurcharge(selectedSize) : 0;
  const categoryQuantities = getCategoryQuantities(items);
  const promoQuantity = (categoryQuantities[product.category] ?? 0) + quantity;
  const promoUnit = getPromoUnitPrice(promoQuantity, {
    promoPrice: product.promo_price,
    promoMinQty: product.promo_min_qty,
    promoStartsAt: product.promo_starts_at,
  });
  const displayPrice = selectedSize
    ? computePriceForSize(promoUnit != null ? promoUnit : product.price, selectedSize)
    : promoUnit != null
      ? promoUnit
      : product.price;

  function handleAdd() {
    if (!selectedSize) {
      setError("Selecione o tamanho da camisa.");
      setFeedback(null);
      return;
    }

    const item: CartItem = {
      id: createCartItemId(product.id, selectedSize),
      productId: product.id,
      slug: product.slug,
      name: product.name,
      club: product.club,
      season: product.season || null,
      category: product.category,
      imageUrl: product.image_url,
      size: selectedSize,
      quantity,
      unitPrice: computeUnitPrice(product.price, selectedSize),
      promoPrice: product.promo_price ?? null,
      promoMinQty: product.promo_min_qty ?? null,
      promoStartsAt: product.promo_starts_at ?? null,
      personalization: { enabled: false, price: 0 },
      patch: { enabled: false, price: 0 },
    };

    addItem(item);
    setError(null);
    setFeedback("Produto adicionado ao carrinho.");
    setQuantity(1);
  }

  const promoStarted = isPromoStarted(product.promo_starts_at);
  const hasQtyRule = product.promo_min_qty != null && product.promo_min_qty > 1;
  const categoryName = CATEGORY_LABELS[product.category].toLowerCase();
  const promoNote = !promoStarted
    ? product.promo_starts_at
      ? hasQtyRule
        ? `Promoção programada: a partir de ${formatDate(product.promo_starts_at)}, leve ${product.promo_min_qty}+ camisas ${categoryName} por ${formatBRL(product.promo_price as number)} cada.`
        : `Promoção programada: a partir de ${formatDate(product.promo_starts_at)}, camisas ${categoryName} por ${formatBRL(product.promo_price as number)}.`
      : null
    : promoUnit != null && hasQtyRule
      ? `Preço promocional de ${formatBRL(product.promo_price as number)} aplicado para ${product.promo_min_qty}+ camisas ${categoryName}.`
      : promoUnit != null
        ? `Promoção de pré-inauguração: camisas ${categoryName} por ${formatBRL(product.promo_price as number)}.`
        : product.promo_price != null && hasQtyRule
          ? `Leve ${product.promo_min_qty}+ camisas ${categoryName} e pague ${formatBRL(product.promo_price)} cada.`
          : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-2">
        <ProductPrice
          price={displayPrice}
          originalPrice={promoUnit != null ? product.price : null}
        />
        {promoNote ? (
          <p className="rounded-md bg-brand/15 px-2.5 py-1 font-body text-sm font-semibold text-brand">
            {promoNote}
          </p>
        ) : null}
        {surcharge > 0 ? (
          <p className="rounded-md bg-amber-400/15 px-2.5 py-1 font-body text-sm font-semibold text-amber-300">
            Acréscimo de {formatBRL(surcharge)} para o tamanho {selectedSize}.
          </p>
        ) : null}
      </div>

      <p className="font-body text-base leading-relaxed text-mist">{product.description}</p>

      <div className="rounded-xl border border-ash bg-graphite p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          <ProductSelector
            selectedSize={selectedSize}
            onSelect={(size) => {
              setSelectedSize(size);
              setError(null);
            }}
          />

          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-wider text-paper">
              Quantidade
            </p>
            <CartQuantityControl
              className="mt-3"
              quantity={quantity}
              onChange={setQuantity}
              label="Quantidade"
              max={MAX_CART_ITEM_QUANTITY}
            />
          </div>

          <div aria-live="polite">
            {error ? (
              <p className="font-body text-sm font-semibold text-paper">{error}</p>
            ) : null}
            {feedback ? (
              <p className="flex items-center gap-2 font-body text-sm font-semibold text-brand">
                <Check className="size-4" aria-hidden="true" />
                {feedback}
              </p>
            ) : null}
          </div>

          <Button onClick={handleAdd} size="lg" className="w-full sm:w-auto sm:min-w-56">
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </div>
  );
}
