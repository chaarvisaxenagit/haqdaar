// Results: one card per scheme with status, every reason, tips, benefit, deadlines,
// source link and last-checked date. Total yearly money at the top.
// Results are worked out again from the answers each time (never stored).
import { useMemo } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { evaluateAll } from '../../engine/evaluate'
import { useI18n } from '../../shared/i18n'
import { formatRupees, todayString } from '../../shared/dates'
import SchemeCard, { SCHEME_BY_ID } from '../../shared/SchemeCard'
import { BigButton, HaqdaarIdLine, ListenButton, Page } from '../../shared/ui'
import { getCurrent } from './storage'

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
