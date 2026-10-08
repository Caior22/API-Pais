const nf = new Intl.NumberFormat("pt-BR");
const compact = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatNumber(n: number | null | undefined): string {
  return typeof n === "number" ? nf.format(n) : "—";
}

export function formatCompact(n: number): string {
  return compact.format(n);
}

/** "BRL" -> "Real brasileiro (BRL)" */
export function currencyLabel(code: string | null): string {
  if (!code) return "—";
  try {
    const name = new Intl.DisplayNames(["pt-BR"], { type: "currency" }).of(code);
    const label = name && name !== code ? name : null;
    const capitalized = label ? label.charAt(0).toUpperCase() + label.slice(1) : null;
    return capitalized ? `${capitalized} (${code})` : code;
  } catch {
    return code;
  }
}

export function formatCoords(lat: number | null, lng: number | null): string {
  if (lat === null || lng === null) return "—";
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "L" : "O";
  return `${Math.abs(lat)}° ${ns}, ${Math.abs(lng)}° ${ew}`;
}
