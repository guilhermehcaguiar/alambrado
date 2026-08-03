import { NextResponse } from "next/server";
import type { z } from "zod";
import { whatsappCheckoutInputSchema } from "@/lib/validations/checkout";
import { isRateLimited } from "@/lib/rateLimit";
import {
  CheckoutError,
  CHECKOUT_ERROR_STATUS,
  resolveWhatsAppCheckout,
} from "@/services/checkout";

const MAX_BODY_BYTES = 50 * 1024;

function errorResponse(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

function firstCheckoutIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `checkout:${ip}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (isRateLimited(clientKey(request))) {
    return errorResponse(
      429,
      "RATE_LIMITED",
      "Muitas tentativas. Aguarde um instante e tente novamente.",
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return errorResponse(413, "PAYLOAD_TOO_LARGE", "Pedido grande demais para processar.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Envie um JSON válido.");
  }

  const parsed = whatsappCheckoutInputSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      400,
      "INVALID_PAYLOAD",
      firstCheckoutIssueMessage(parsed.error),
    );
  }

  try {
    const result = await resolveWhatsAppCheckout(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CheckoutError) {
      console.error("[checkout] falha conhecida", {
        code: error.code,
        message: error.message,
      });
      const status = CHECKOUT_ERROR_STATUS[error.code];
      return errorResponse(status, error.code, error.message);
    }
    console.error("[checkout] erro inesperado", {
      name: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(
      500,
      "INTERNAL",
      "Não foi possível preparar seu pedido. Tente novamente.",
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return errorResponse(405, "METHOD_NOT_ALLOWED", "Método não permitido.");
}
