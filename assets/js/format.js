/**
 * Format a whole-rupee amount with Indian digit grouping (₹1,00,000).
 * Amounts are rounded to the nearest rupee; the demo never shows paise.
 */
export function formatINR(amount) {
  const n = Math.round(amount)
  const s = String(Math.abs(n))
  const last3 = s.slice(-3)
  const rest = s.slice(0, -3)
  const grouped = rest
    ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3
    : last3
  return `${n < 0 ? '-' : ''}₹${grouped}`
}
