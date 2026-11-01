// Deadlines, alerts and the follow-up list.
// Every function takes "today" as input; the engine never reads the clock.
import type { FarmerRecord, SchemeResult, SchemeStatus } from '../shared/types'
import { addDays, daysBetween } from './dates'
import { evaluateAll } from './evaluate'

export interface DeadlineAlert {
  schemeId: string
  status: SchemeStatus
  labelKey: string
  date: string
  daysLeft: number
}

export interface FollowUpItem {
  schemeId?: string // empty when the reason is only the follow-up date
  status?: SchemeStatus
  labelKey?: string
  date: string
  daysLeft: number
}

// Only these results need action before a deadline.
function needsAction(status: SchemeStatus): boolean {
  return status === 'likely_eligible' || status === 'check_office'
}

// Every deadline in the next "days" days for schemes that need action, soonest first.
export function upcomingDeadlines(results: SchemeResult[], today: string, days: number): DeadlineAlert[] {
  const alerts: DeadlineAlert[] = []
  for (const r of results) {
    if (!needsAction(r.status)) continue
    for (const d of r.deadlines) {
      const daysLeft = daysBetween(today, d.date)
      if (daysLeft >= 0 && daysLeft <= days) {
        alerts.push({ schemeId: r.schemeId, status: r.status, labelKey: d.labelKey, date: d.date, daysLeft })
      }
    }
  }
  return alerts.sort((a, b) => a.date.localeCompare(b.date))
}

// Farmer mode: the banner shows deadlines in the next 30 days.
export function farmerAlerts(results: SchemeResult[], today: string): DeadlineAlert[] {
  return upcomingDeadlines(results, today, 30)
}

// Operator mode: why this farmer is on the follow-up list (soonest first), or null if not on it.
// (a) a scheme that needs action has a deadline in the next 14 days and the farmer has not applied yet, or
// (b) the follow-up date is today or earlier.
export function getFollowUp(record: FarmerRecord, today: string): FollowUpItem | null {
  const results = evaluateAll(record.answers, today)
  const items: FollowUpItem[] = upcomingDeadlines(results, today, 14).filter((a) => {
    const appStatus = record.statuses[a.schemeId] ?? 'not_started'
    return appStatus === 'not_started' || appStatus === 'documents_ready'
  })
  if (record.followUpDate && record.followUpDate <= today) {
    items.push({ date: record.followUpDate, daysLeft: daysBetween(today, record.followUpDate) })
  }
  if (items.length === 0) return null
  items.sort((a, b) => a.date.localeCompare(b.date))
  return items[0]
}

// Suggested follow-up date: 14 days before the soonest deadline of a scheme that needs action
// (today if that day has passed). Empty if there is no deadline.
export function suggestFollowUpDate(results: SchemeResult[], today: string): string {
  const dates = results
    .filter((r) => needsAction(r.status))
    .flatMap((r) => r.deadlines.map((d) => d.date))
    .sort()
  if (dates.length === 0) return ''
  const suggested = addDays(dates[0], -14)
  return suggested < today ? today : suggested
}
