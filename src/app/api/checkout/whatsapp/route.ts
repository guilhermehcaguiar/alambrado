import { NextResponse } from "next/server";
import type { z } from "zod";
import { whatsappCheckoutInputSchema } from "@/lib/validations/checkout";
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

export async function POST(request: Request): Promise<NextResponse> {
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
      const status = CHECKOUT_ERROR_STATUS[error.code];
      return errorResponse(status, error.code, error.message);
    }
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
