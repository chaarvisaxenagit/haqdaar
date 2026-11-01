// Results: one card per scheme with status, every reason, tips, benefit, deadlines,
// source link and last-checked date. Total yearly money at the top.
// Results are worked out again from the answers each time (never stored).
import { useMemo } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { SchemeResult } from '../../shared/types'
import { evaluateAll, SCHEMES } from '../../engine/evaluate'
import { daysBetween } from '../../engine/dates'
import { useI18n } from '../../shared/i18n'
import { formatDate, formatRupees, todayString } from '../../shared/dates'
import { BigButton, Card, HaqdaarIdLine, ListenButton, Page, StatusBadge } from '../../shared/ui'
import { getCurrent } from './storage'

const SCHEME_BY_ID = Object.fromEntries(SCHEMES.map((s) => [s.id, s]))

function SchemeCard({ result, today }: { result: SchemeResult; today: string }) {
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

export default function Results() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const current = getCurrent()
  const today = todayString()
  const results = useMemo(() => (current ? evaluateAll(current.answers, today) : []), [current, today])

  if (!current) return <Navigate to="/f/questions" replace />

  // Fixed yearly money only from schemes that are likely eligible (e.g. ₹6,000 from PM-KISAN).
  const paying = results.filter((r) => r.status === 'likely_eligible' && r.yearlyAmount > 0)
  const total = paying.reduce((sum, r) => sum + r.yearlyAmount, 0)
  const totalText = t('results.total', {
    amount: formatRupees(total),
    names: paying.map((r) => t(SCHEME_BY_ID[r.schemeId].nameKey)).join(', '),
  })
  const saveFailed = (location.state as { saveFailed?: boolean } | null)?.saveFailed

  return (
    <Page title={t('page.results.title')}>
      {saveFailed && <p className="rounded-lg border-2 border-red-700 bg-red-50 p-3 text-lg">{t('results.notSaved')}</p>}
      {current.haqdaarId && <HaqdaarIdLine id={current.haqdaarId} />}

      {total > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-green-700 bg-green-50 p-4">
          <p className="text-xl font-bold text-green-900">💰 {totalText}</p>
          <ListenButton text={totalText} />
        </div>
      )}

      <p className="text-lg text-gray-800">{t('results.likelyNote')}</p>

      {results.map((r) => (
        <SchemeCard key={r.schemeId} result={r} today={today} />
      ))}

      <BigButton icon="📄" variant="primary" onClick={() => navigate('/f/checklist')}>
        {t('results.toChecklist')}
      </BigButton>
      <BigButton icon="🖨️" onClick={() => navigate('/f/slip')}>
        {t('results.toSlip')}
      </BigButton>
      <BigButton icon="🏠" onClick={() => navigate('/f')}>
        {t('nav.farmerHome')}
      </BigButton>
    </Page>
  )
}
