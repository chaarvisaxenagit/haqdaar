// Small date helpers. Dates are text "YYYY-MM-DD". "today" is always passed in;
// the engine never reads the clock itself, so tests stay stable.

function toUtc(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

// Number of days from "from" to "to" (negative if "to" is earlier).
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / 86400000)
}

// The next date with this month and day, on or after today.
export function nextDate(month: number, day: number, today: string): string {
  const year = Number(today.slice(0, 4))
  const thisYear = `${year}-${pad(month)}-${pad(day)}`
  return thisYear >= today ? thisYear : `${year + 1}-${pad(month)}-${pad(day)}`
}

// A date some days before (negative) or after (positive) the given date.
export function addDays(date: string, days: number): string {
  const d = new Date(toUtc(date) + days * 86400000)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}
