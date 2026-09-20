export function normalizeBdPhone(phone: string) {
  const compact = phone.replace(/[\s()-]/g, "");
  if (compact.startsWith("+880")) return compact;
  if (compact.startsWith("880")) return `+${compact}`;
  if (compact.startsWith("01")) return `+88${compact}`;
  return compact;
}
