"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import CartQuantityControl from "@/components/cart/CartQuantityControl";
import ProductPrice from "@/components/product/ProductPrice";
import ProductSelector from "@/components/product/ProductSelector";
import { applyExtras, getPromoUnitPrice } from "@/config/prices";
import type { PriceExtras } from "@/services/priceConfig";
import { useCart } from "@/hooks/useCart";
import { MAX_CART_ITEM_QUANTITY, type CartItem } from "@/types/cart";
import { CATEGORY_LABELS, isPromoStarted, type Product, type ProductSize } from "@/types/product";
import { getPromoDisplayText } from "@/utils/promoText";
import { createCartItemId, getCategoryQuantities } from "@/utils/cart";
import { formatBRL, formatDate } from "@/utils/format";

type ProductPurchaseProps = {
  product: Product;
  extras: PriceExtras | null;
};

export default function ProductPurchase({ product, extras }: ProductPurchaseProps) {
  const { addItem, items } = useCart();
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [personalized, setPersonalized] = useState(false);
  const [shirtName, setShirtName] = useState("");
  const [shirtNumber, setShirtNumber] = useState("");

  const personalizationPrice = extras?.personalizationPrice ?? 0;
  const surcharge = selectedSize ? applyExtras(0, selectedSize, extras) : 0;
  const categoryQuantities = getCategoryQuantities(items);
  const promoQuantity = (categoryQuantities[product.category] ?? 0) + quantity;
  const promoUnit = getPromoUnitPrice(promoQuantity, {
    promoPrice: product.promo_price,
    promoMinQty: product.promo_min_qty,
    promoStartsAt: product.promo_starts_at,
    promoTiers: product.promo_tiers,
  });
  const basePromo = promoUnit != null ? promoUnit : product.price;
  const displayPrice = selectedSize
    ? applyExtras(basePromo, selectedSize, extras) + (personalized ? personalizationPrice : 0)
    : basePromo + (personalized ? personalizationPrice : 0);

  const personalization = personalized
    ? { enabled: true as const, name: shirtName.trim() || undefined, number: shirtNumber.trim() || undefined, price: personalizationPrice }
    : { enabled: false as const, price: 0 };

  function handleAdd() {
    if (!selectedSize) {
      setError("Selecione o tamanho da camisa.");
      setFeedback(null);
      return;
    }
    if (personalized && !shirtName.trim() && !shirtNumber.trim()) {
      setError("Informe um nome ou número para a personalização.");
      setFeedback(null);
      return;
    }

    const item: CartItem = {
      id: createCartItemId(product.id, selectedSize, personalization),
      productId: product.id,
      slug: product.slug,
      name: product.name,
      club: product.club,
      season: product.season || null,
      category: product.category,
      imageUrl: product.image_url,
      size: selectedSize,
      quantity,
      unitPrice: product.price + (extras?.oversizedSizes.includes(selectedSize) ? (extras?.oversizedSurcharge ?? 0) : 0) + (personalized ? personalizationPrice : 0),
      promoPrice: product.promo_price ?? null,
      promoMinQty: product.promo_min_qty ?? null,
      promoStartsAt: product.promo_starts_at ?? null,
      promoTiers: product.promo_tiers ?? null,
      oversizedSurcharge: extras?.oversizedSurcharge ?? 0,
      oversizedSizes: extras?.oversizedSizes ?? [],
      personalization,
      patch: { enabled: false, price: 0 },
    };

    addItem(item);
    setError(null);
    setFeedback("Produto adicionado ao carrinho.");
    setQuantity(1);
    setPersonalized(false);
    setShirtName("");
    setShirtNumber("");
  }

  const promoNote = getPromoDisplayText(product);

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
        {personalized ? (
          <p className="rounded-md bg-violet-400/15 px-2.5 py-1 font-body text-sm font-semibold text-violet-300">
            Personalização incluída
            {personalizationPrice > 0 ? ` (+${formatBRL(personalizationPrice)})` : " (grátis)"}
            {shirtName.trim() || shirtNumber.trim()
              ? ` — ${[shirtName.trim(), shirtNumber.trim()].filter(Boolean).join(" · ")}`
              : ""}
            .
          </p>
        ) : null}
      </div>

      <p className="font-body text-base leading-relaxed text-mist">{product.description}</p>

      <div className="rounded-xl border border-ash bg-graphite p-5 sm:p-6">
        <div className="flex flex-col gap-5">
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

          <div className="rounded-lg border border-ash bg-coal p-4">
            <div className="flex items-start justify-between gap-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={personalized}
                  onChange={(event) => {
                    setPersonalized(event.target.checked);
                    setError(null);
                  }}
                  className="mt-1 size-4 accent-[var(--brand)]"
                />
                <span>
                  <span className="flex items-center gap-2 font-body text-base font-semibold text-paper">
                    <Sparkles className="size-4 text-brand" aria-hidden="true" />
                    Personalizar com nome e número
                  </span>
                  <span className="mt-1 block font-body text-sm text-mist">
                    {personalizationPrice > 0
                      ? `Adicional de ${formatBRL(personalizationPrice)} por camisa.`
                      : "Incluso no valor da camisa."}
                  </span>
                </span>
              </label>
            </div>

            {personalized ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="shirtName" className="font-body text-sm font-semibold uppercase tracking-wider text-paper">
                    Nome
                  </label>
                  <input
                    id="shirtName"
                    type="text"
                    value={shirtName}
                    onChange={(e) => setShirtName(e.target.value)}
                    maxLength={40}
                    placeholder="Ex.: João"
                    className="mt-2 w-full min-h-11 rounded-md border border-ash bg-graphite px-3 py-2.5 font-body text-base text-paper placeholder:text-gray focus:outline-2 focus:outline-offset-2 focus:outline-brand"
                  />
                </div>
                <div>
                  <label htmlFor="shirtNumber" className="font-body text-sm font-semibold uppercase tracking-wider text-paper">
                    Número
                  </label>
                  <input
                    id="shirtNumber"
                    type="text"
                    value={shirtNumber}
                    onChange={(e) => setShirtNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    maxLength={3}
                    placeholder="Ex.: 10"
                    className="mt-2 w-full min-h-11 rounded-md border border-ash bg-graphite px-3 py-2.5 font-body text-base text-paper placeholder:text-gray focus:outline-2 focus:outline-offset-2 focus:outline-brand"
                  />
                </div>
              </div>
            ) : null}
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
