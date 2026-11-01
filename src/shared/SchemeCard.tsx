// One result card for a scheme. Used by farmer mode and operator mode.
// Shows status, every reason, tips, benefit, deadlines, the source and a Listen button.
import type { CSSProperties, ReactNode } from 'react'
import type { SchemeResult } from './types'
import { SCHEMES } from '../engine/evaluate'
import { daysBetween } from '../engine/dates'
import { useI18n } from './i18n'
import { formatDate } from './dates'
import { ListenButton, SchemeIcon, StatusBadge } from './ui'

export const SCHEME_BY_ID = Object.fromEntries(SCHEMES.map((s) => [s.id, s]))

// "https://pmkisan.gov.in" -> "pmkisan.gov.in"
export function siteName(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

export default function SchemeCard({
  result,
  today,
  i = 0,
  children,
}: {
  result: SchemeResult
  today: string
  i?: number // position, for the rise-in animation
  children?: ReactNode // extra controls, e.g. the operator's status dropdown
}) {
  const { t } = useI18n()
  const scheme = SCHEME_BY_ID[result.schemeId]
  const name = t(scheme.nameKey)

  // Everything on the card, read aloud in order.
  const spoken = [
    name,
    t(`status.${result.status}`),
    ...result.reasons.map((k) => t(k)),
    ...result.tips.map((k) => t(k)),
    `${t('results.benefit')}: ${t(result.benefitKey)}`,
    ...result.deadlines.map((d) => `${t(d.labelKey)}: ${formatDate(d.date, t)}`),
  ].join('. ')

  return (
    <article className={`card st-${result.status}`} style={{ '--i': i } as CSSProperties}>
      <div className="card-head">
        <SchemeIcon schemeId={scheme.id} icon={scheme.icon} i={i} />
        <h3>{name}</h3>
      </div>
      <StatusBadge status={result.status} />
      {result.reasons.map((k) => (
        <p key={k} className="reason">
          {t(k)}
        </p>
      ))}
      {result.tips.map((k) => (
        <p key={k} className="tip">
          💡 {t(k)}
        </p>
      ))}
      <p className="benefit">
        <b>{t('results.benefit')}:</b> {t(result.benefitKey)}
      </p>
      {result.deadlines.map((d) => (
        <p key={d.labelKey} className="benefit">
          📅 <b>{t(d.labelKey)}:</b> {formatDate(d.date, t)} ({t('results.daysLeft', { n: daysBetween(today, d.date) })})
        </p>
      ))}
      {children}
      <p className="source">
        {t('results.sourceLabel')}:{' '}
        <a href={result.sourceUrl} target="_blank" rel="noreferrer">
          {siteName(result.sourceUrl)}
        </a>{' '}
        · {t('results.checkedOn', { date: formatDate(result.lastVerified, t) })}
      </p>
      <ListenButton text={spoken} />
    </article>
  )
}
