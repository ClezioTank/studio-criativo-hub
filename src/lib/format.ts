const LOCALE_BY_CURRENCY: Record<string, string> = {
  Kz: "pt-AO",
  BRL: "pt-BR",
  USD: "en-US",
  EUR: "pt-PT",
};

export function formatMoney(amount: number | string | null | undefined, currency = "Kz") {
  const value = Number(amount ?? 0);
  const formatted = new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency] ?? "pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return currency === "Kz" ? `${formatted} Kz` : `${currency} ${formatted}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "numeric" }).format(
    date,
  );
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
