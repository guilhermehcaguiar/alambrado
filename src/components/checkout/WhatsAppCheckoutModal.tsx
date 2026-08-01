"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import { nameSchema } from "@/lib/validations/checkout";
import type { CartItem } from "@/types/cart";
import type { WhatsAppCheckoutInput, WhatsAppCheckoutResponse } from "@/types/checkout";
import { formatBRL } from "@/utils/format";

type WhatsAppCheckoutModalProps = {
  items: CartItem[];
  localSubtotal: number;
  onClose: () => void;
};

type FormValues = {
  customerName: string;
};

type CheckoutStatus = "idle" | "submitting" | "price-changed" | "redirecting";

const GENERIC_ERROR = "Não foi possível preparar seu pedido. Tente novamente.";

const PRICE_EPSILON = 0.005;

export default function WhatsAppCheckoutModal({
  items,
  localSubtotal,
  onClose,
}: WhatsAppCheckoutModalProps) {
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [serverResult, setServerResult] = useState<{
    data: WhatsAppCheckoutResponse;
  } | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { customerName: "" },
  });

  const busy = status === "submitting" || status === "redirecting";

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    dialogRef.current
      ?.querySelector<HTMLInputElement>("#customerName")
      ?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && status === "idle") {
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) {
          return;
        }
        const focusables = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) {
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [status, onClose]);

  function handleBackdrop() {
    if (status === "idle") {
      onClose();
    }
  }

  function buildPayload(customerName: string): WhatsAppCheckoutInput {
    return {
      customerName,
      items: items.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      })),
    };
  }

  function redirectToWhatsApp(url: string) {
    window.location.assign(url);
  }

  async function startCheckout(customerName: string) {
    setStatus("submitting");
    setCheckoutError(null);

    try {
      const response = await fetch("/api/checkout/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(customerName)),
      });

      if (!response.ok) {
        let message = GENERIC_ERROR;
        try {
          const body = (await response.json()) as { error?: { message?: string } };
          if (body?.error?.message) {
            message = body.error.message;
          }
        } catch {
          // Corpo de erro inválido: usa a mensagem padrão.
        }
        setCheckoutError(message);
        setStatus("idle");
        return;
      }

      const data = (await response.json()) as WhatsAppCheckoutResponse;
      const priceChanged = Math.abs(data.total - localSubtotal) > PRICE_EPSILON;

      if (priceChanged) {
        setServerResult({ data });
        setStatus("price-changed");
        return;
      }

      setStatus("redirecting");
      redirectToWhatsApp(data.whatsappUrl);
    } catch {
      setCheckoutError(GENERIC_ERROR);
      setStatus("idle");
    }
  }

  function onSubmit(values: FormValues) {
    if (busy) {
      return;
    }

    if (status === "price-changed" && serverResult) {
      setStatus("redirecting");
      redirectToWhatsApp(serverResult.data.whatsappUrl);
      return;
    }

    const nameResult = nameSchema.safeParse(values.customerName);
    if (!nameResult.success) {
      const message =
        nameResult.error.issues[0]?.message ?? "Informe seu nome (mínimo de 2 caracteres).";
      setError("customerName", { type: "manual", message });
      return;
    }

    void startCheckout(nameResult.data);
  }

  const displayedTotal = serverResult?.data.total ?? localSubtotal;
  const submitLabel =
    status === "price-changed" ? "Confirmar novo total e continuar" : "Continuar no WhatsApp";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={handleBackdrop}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-ash bg-graphite p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="checkout-title"
              className="font-display text-3xl uppercase leading-none tracking-wide text-paper"
            >
              Finalizar pelo WhatsApp
            </h2>
            <p className="mt-2 font-body text-sm text-mist">
              Informe seu nome para prepararmos a mensagem do seu pedido.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Fechar modal"
            className="rounded-md p-2 text-mist transition-colors duration-200 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <CheckoutOrderSummary items={items} total={displayedTotal} />

        {status === "price-changed" && serverResult ? (
          <div className="mt-4 rounded-lg border border-brand/60 bg-coal px-4 py-3">
            <p className="font-body text-sm font-semibold text-paper">
              O valor de um produto foi atualizado.
            </p>
            <p className="mt-1 font-body text-sm text-mist">
              O total agora é {formatBRL(serverResult.data.total)}. Confirme antes de
              continuar.
            </p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label
              htmlFor="customerName"
              className="font-body text-sm font-semibold uppercase tracking-wider text-paper"
            >
              Seu nome
            </label>
            <input
              id="customerName"
              type="text"
              autoComplete="name"
              placeholder="Como podemos chamar você?"
              disabled={busy}
              aria-invalid={Boolean(errors.customerName)}
              className="mt-2 w-full rounded-md border border-ash bg-coal px-3 py-2.5 font-body text-base text-paper placeholder:text-mist focus:outline-2 focus:outline-offset-2 focus:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
              {...register("customerName")}
            />
            {errors.customerName ? (
              <p role="alert" className="mt-1.5 font-body text-sm font-semibold text-mist">
                {errors.customerName.message}
              </p>
            ) : null}
          </div>

          {checkoutError ? (
            <p role="alert" className="font-body text-sm font-semibold text-mist">
              {checkoutError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={busy}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="whatsapp"
              disabled={busy}
              className="w-full sm:w-auto"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {status === "submitting"
                ? "Preparando…"
                : status === "redirecting"
                  ? "Abrindo WhatsApp…"
                  : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
