// Farmer-mode alert: every deadline in the next 30 days for schemes that are
// likely eligible or "check with office". Big banner with Listen.
import type { SchemeResult } from '../../shared/types'
import { farmerAlerts } from '../../engine/deadlines'
import { useI18n } from '../../shared/i18n'
import { formatDate } from '../../shared/dates'
import { SCHEME_BY_ID } from '../../shared/SchemeCard'
import { ListenButton } from '../../shared/ui'
import { daysText } from './daysText'

export default function DeadlineBanner({ results, today }: { results: SchemeResult[]; today: string }) {
  const { t } = useI18n()
  const alerts = farmerAlerts(results, today)
  if (alerts.length === 0) return null

  const lines = alerts.map(
    (a) => `${t(SCHEME_BY_ID[a.schemeId].nameKey)}: ${t(a.labelKey)}, ${formatDate(a.date, t)} (${daysText(a.daysLeft, t)})`,
  )

  return (
    <section role="alert" className="banner alert">
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>⏰ {t('alert.title')}</h2>
      <ul>
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <ListenButton text={`${t('alert.title')}. ${lines.join('. ')}`} />
    </section>
  )
}
