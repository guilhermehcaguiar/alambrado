"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import CartQuantityControl from "@/components/cart/CartQuantityControl";
import ProductSelector from "@/components/product/ProductSelector";
import { useCart } from "@/hooks/useCart";
import { MAX_CART_ITEM_QUANTITY, type CartItem } from "@/types/cart";
import type { Product, ProductSize } from "@/types/product";
import { computeUnitPrice, createCartItemId } from "@/utils/cart";

type ProductPurchaseProps = {
  product: Product;
};

export default function ProductPurchase({ product }: ProductPurchaseProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

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
      personalization: { enabled: false, price: 0 },
      patch: { enabled: false, price: 0 },
    };

    addItem(item);
    setError(null);
    setFeedback("Produto adicionado ao carrinho.");
    setQuantity(1);
  }

  return (
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
  );
}
