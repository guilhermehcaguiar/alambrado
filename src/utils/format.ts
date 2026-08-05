export function formatBRL(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) {
    return isoDate;
  }
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("pt-BR");
}
