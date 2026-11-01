// "आज", "11 दिन बाकी" or "3 दिन देर" for a number of days left.
export function daysText(daysLeft: number, t: (key: string, vars?: Record<string, string | number>) => string): string {
  if (daysLeft === 0) return t('followUp.today')
  if (daysLeft < 0) return t('followUp.overdue', { n: -daysLeft })
  return t('results.daysLeft', { n: daysLeft })
}
