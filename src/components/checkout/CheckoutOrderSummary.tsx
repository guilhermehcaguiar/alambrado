import { formatBRL } from "@/utils/format";
import { getCategoryQuantities, getItemSubtotal, getItemUnitPrice } from "@/utils/cart";
import type { CartItem } from "@/types/cart";

type CheckoutOrderSummaryProps = {
  items: CartItem[];
  total: number;
};

export default function CheckoutOrderSummary({ items, total }: CheckoutOrderSummaryProps) {
  const categoryQuantities = getCategoryQuantities(items);
  return (
    <div className="mt-5 rounded-lg border border-ash bg-coal p-4">
      <p className="font-body text-sm font-semibold text-paper">Resumo do pedido</p>

      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 font-body text-sm">
            <div className="min-w-0">
              <p className="text-paper">{item.name}</p>
              <p className="mt-0.5 text-xs text-mist">
                Tamanho {item.size} · {item.quantity}x · {formatBRL(getItemUnitPrice(item, categoryQuantities))}
              </p>
            </div>
            <span className="shrink-0 text-paper">
              {formatBRL(getItemSubtotal(item, categoryQuantities))}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-ash pt-3">
        <p className="font-body text-sm font-semibold text-paper">Total estimado</p>
        <p className="font-display text-2xl tracking-wide text-brand">{formatBRL(total)}</p>
      </div>

      <p className="mt-3 font-body text-xs leading-relaxed text-mist">
        Os valores serão conferidos antes de abrir o WhatsApp.
      </p>
    </div>
  );
}
