// Results: next-deadline banner, yearly money card, then one card per scheme.
// Results are worked out again from the answers each time (never stored).
import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { SchemeResult, SchemeStatus } from '../../shared/types'
import { evaluateAll } from '../../engine/evaluate'
import { upcomingDeadlines } from '../../engine/deadlines'
import { useI18n } from '../../shared/i18n'
import { formatDate, formatRupees, todayString } from '../../shared/dates'
import SchemeCard, { SCHEME_BY_ID } from '../../shared/SchemeCard'
import { BigButton, ListenButton, SchemeIcon, STATUS_ICON } from '../../shared/ui'
import { daysText } from '../deadlines/daysText'
import { getCurrent } from './storage'

const STATUS_ORDER: SchemeStatus[] = ['likely_eligible', 'check_office', 'already_have', 'likely_not_eligible']

// "Next last date: Rabi crop insurance – 31 December 2026 (60 days left)"
export function NextDeadlineBanner({ results, today }: { results: SchemeResult[]; today: string }) {
  const { t } = useI18n()
  const next = upcomingDeadlines(results, today, 366)[0]
  if (!next) return null
  return (
    <div className="banner">
      ℹ️ {t('results.nextDeadline', { label: t(next.labelKey), date: formatDate(next.date, t), days: daysText(next.daysLeft, t) })}
    </div>
  )
}

// Big brown card with a spinning ₹ coin: fixed yearly money from likely-eligible schemes.
export function MoneyCard({ results }: { results: SchemeResult[] }) {
  const { t } = useI18n()
  const paying = results.filter((r) => r.status === 'likely_eligible' && r.yearlyAmount > 0)
  const total = paying.reduce((sum, r) => sum + r.yearlyAmount, 0)
  const names = paying.map((r) => t(SCHEME_BY_ID[r.schemeId].nameKey)).join(', ')
  const text = total > 0 ? t('results.moneyAmount', { amount: formatRupees(total), names }) : t('results.moneyNone')
  return (
    <div className={`money${total > 0 ? '' : ' none'}`}>
      {total > 0 ? (
        <span className="coin" aria-hidden="true">
          <span className="coin-face">₹</span>
          <span className="coin-face back">₹</span>
        </span>
      ) : (
        <span className="sprout" aria-hidden="true">
          🌱
        </span>
      )}
      <div>
        <div className="lbl">{t('results.moneyLabel')}</div>
        <div className="amt">{text}</div>
      </div>
    </div>
  )
}

// "✅ Likely eligible: 3 · ❓ Ask the agriculture office: 1"
export function StatusCounts({ results }: { results: SchemeResult[] }) {
  const { t } = useI18n()
  const parts = STATUS_ORDER.map((s) => [s, results.filter((r) => r.status === s).length] as const)
    .filter(([, n]) => n > 0)
    .map(([s, n]) => `${STATUS_ICON[s]} ${t(`status.${s}`)}: ${n}`)
  return <p className="counts">{parts.join(' · ')}</p>
}

// Dashed "state scheme coming soon" card.
export function SoonCard({ i }: { i: number }) {
  const { t } = useI18n()
  return (
    <article className="card soon" style={{ '--i': i } as CSSProperties} aria-disabled="true">
      <div className="card-head">
        <SchemeIcon schemeId="soon" icon="🏛️" />
        <h3>{t('results.soonTitle')}</h3>
      </div>
      <p className="small">{t('results.soonText')}</p>
    </article>
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

  const saveFailed = (location.state as { saveFailed?: boolean } | null)?.saveFailed
  const paying = results.filter((r) => r.status === 'likely_eligible' && r.yearlyAmount > 0)
  const moneyText =
    paying.length > 0
      ? t('results.moneyAmount', {
          amount: formatRupees(paying.reduce((s, r) => s + r.yearlyAmount, 0)),
          names: paying.map((r) => t(SCHEME_BY_ID[r.schemeId].nameKey)).join(', '),
        })
      : t('results.moneyNone')

  return (
    <main className="is-wide">
      {saveFailed && <div className="banner alert">{t('results.notSaved')}</div>}
      <NextDeadlineBanner results={results} today={today} />
      <h1>{t('page.results.title')}</h1>
      {current.haqdaarId && (
        <p className="who">
          {t('results.haqdaarId')}: <span className="mono">{current.haqdaarId}</span>
        </p>
      )}
      <MoneyCard results={results} />
      <ListenButton text={`${t('results.moneyLabel')}: ${moneyText}`} />
      <StatusCounts results={results} />

      <div className="grid">
        {results.map((r, i) => (
          <SchemeCard key={r.schemeId} result={r} today={today} i={i} />
        ))}
        <SoonCard i={results.length} />
      </div>

      <p className="demo-note">{t('results.likelyNote')}</p>
      <div className="actions">
        <BigButton icon="📄" variant="primary" onClick={() => navigate('/f/checklist')}>
          {t('results.toChecklist')}
        </BigButton>
        <BigButton icon="🧾" onClick={() => navigate('/f/slip')}>
          {t('results.toSlip')}
        </BigButton>
        <BigButton icon="🏠" onClick={() => navigate('/f')}>
          {t('nav.farmerHome')}
        </BigButton>
      </div>
    </main>
  )
}
