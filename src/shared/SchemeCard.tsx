// One result card for a scheme. Used by farmer mode and operator mode.
// Shows status, every reason, tips, benefit, deadlines, a Listen button,
// the source link and the last-checked date.
import type { ReactNode } from 'react'
import type { SchemeResult } from './types'
import { SCHEMES } from '../engine/evaluate'
import { daysBetween } from '../engine/dates'
import { useI18n } from './i18n'
import { formatDate } from './dates'
import { Card, ListenButton, StatusBadge } from './ui'

export const SCHEME_BY_ID = Object.fromEntries(SCHEMES.map((s) => [s.id, s]))

export default function SchemeCard({
  result,
  today,
  children,
}: {
  result: SchemeResult
  today: string
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
    <Card>
      <h2 className="flex items-start gap-2 text-xl font-bold">
        <span aria-hidden="true">{scheme.icon}</span>
        <span>{name}</span>
      </h2>
      <div>
        <StatusBadge status={result.status} />
      </div>

      <div>
        <h3 className="text-lg font-bold">{t('results.why')}</h3>
        <ul className="list-disc ps-6 text-lg">
          {result.reasons.map((k) => (
            <li key={k}>{t(k)}</li>
          ))}
        </ul>
      </div>

      {result.tips.length > 0 && (
        <div className="rounded-lg border-2 border-amber-600 bg-amber-50 p-3">
          <h3 className="text-lg font-bold">💡 {t('results.tips')}</h3>
          <ul className="list-disc ps-6 text-lg">
            {result.tips.map((k) => (
              <li key={k}>{t(k)}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold">{t('results.benefit')}</h3>
        <p className="text-lg">{t(result.benefitKey)}</p>
      </div>

      {result.deadlines.length > 0 && (
        <div>
          <h3 className="text-lg font-bold">📅 {t('results.deadline')}</h3>
          {result.deadlines.map((d) => (
            <p key={d.labelKey} className="text-lg">
              {t(d.labelKey)}: <strong>{formatDate(d.date, t)}</strong> ({t('results.daysLeft', { n: daysBetween(today, d.date) })})
            </p>
          ))}
        </div>
      )}

      {children}

      <ListenButton text={spoken} />

      <p className="text-base text-gray-800">
        <a href={result.sourceUrl} target="_blank" rel="noreferrer" className="font-medium text-green-800 underline">
          {t('results.source')}
        </a>
        {' · '}
        {t('results.lastVerified', { date: formatDate(result.lastVerified, t) })}
      </p>
    </Card>
  )
}
