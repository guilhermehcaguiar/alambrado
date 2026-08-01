export function getWhatsAppNumber(): string {
  if (typeof window !== "undefined") {
    throw new Error("WHATSAPP_NUMBER só pode ser acessado no servidor.");
  }

  const raw = process.env.WHATSAPP_NUMBER ?? "";
  const digits = raw.replace(/\D/g, "");

  if (!/^\d{10,15}$/.test(digits)) {
    throw new Error("WHATSAPP_NUMBER deve conter somente dígitos no formato internacional.");
  }

  return digits;
}

export function isWhatsAppConfigured(): boolean {
  const raw = process.env.WHATSAPP_NUMBER ?? "";
  return /^\d{10,15}$/.test(raw.replace(/\D/g, ""));
}
