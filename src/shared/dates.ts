// Date helpers for the screens. (The engine never reads the clock; screens pass today in.)

// Today's date on this phone, as "YYYY-MM-DD".
export function todayString(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// "2026-12-31" -> "31 दिसंबर 2026" (month names come from the translation files).
export function formatDate(date: string, t: (key: string) => string): string {
  const [y, m, d] = date.split('-').map(Number)
  return `${d} ${t(`month.${m}`)} ${y}`
}

// 6000 -> "6,000" (Indian digit grouping).
export function formatRupees(amount: number): string {
  return amount.toLocaleString('en-IN')
}
