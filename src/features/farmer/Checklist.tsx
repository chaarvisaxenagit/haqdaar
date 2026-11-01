// Checklist: papers to bring for each scheme that is likely eligible or "check with office", with tips.
import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { evaluateAll, SCHEMES } from '../../engine/evaluate'
import { useI18n } from '../../shared/i18n'
import { todayString } from '../../shared/dates'
import { BigButton, Card, ListenButton, Page, StatusBadge } from '../../shared/ui'
import { getCurrent } from './storage'

const SCHEME_BY_ID = Object.fromEntries(SCHEMES.map((s) => [s.id, s]))

export default function Checklist() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const current = getCurrent()
  const today = todayString()
  // Ticks are only for this visit; they are not saved.
  const [ticked, setTicked] = useState<Record<string, boolean>>({})
  const results = useMemo(() => (current ? evaluateAll(current.answers, today) : []), [current, today])

  if (!current) return <Navigate to="/f/questions" replace />

  const withDocs = results.filter((r) => r.documents.length > 0)

  return (
    <Page title={t('page.checklist.title')}>
      <p className="text-lg">{withDocs.length > 0 ? t('checklist.intro') : t('checklist.none')}</p>

      {withDocs.map((r) => {
        const scheme = SCHEME_BY_ID[r.schemeId]
        const name = t(scheme.nameKey)
        const spoken = [name, ...r.documents.map((k) => t(k)), ...r.tips.map((k) => t(k))].join('. ')
        return (
          <Card key={r.schemeId}>
            <h2 className="flex items-start gap-2 text-xl font-bold">
              <span aria-hidden="true">{scheme.icon}</span>
              <span>{name}</span>
            </h2>
            <div>
              <StatusBadge status={r.status} />
            </div>
            <ul className="flex flex-col gap-2">
              {r.documents.map((k) => {
                const id = `${r.schemeId}:${k}`
                return (
                  <li key={k}>
                    <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-300 px-3 py-2 text-lg">
                      <input
                        type="checkbox"
                        checked={!!ticked[id]}
                        onChange={(e) => setTicked({ ...ticked, [id]: e.target.checked })}
                        className="size-7 shrink-0 accent-green-700"
                      />
                      <span>{t(k)}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
            {r.tips.length > 0 && (
              <div className="rounded-lg border-2 border-amber-600 bg-amber-50 p-3">
                <h3 className="text-lg font-bold">💡 {t('results.tips')}</h3>
                <ul className="list-disc ps-6 text-lg">
                  {r.tips.map((k) => (
                    <li key={k}>{t(k)}</li>
                  ))}
                </ul>
              </div>
            )}
            <ListenButton text={spoken} />
          </Card>
        )
      })}

      <BigButton icon="📋" onClick={() => navigate('/f/results')}>
        {t('home.seeResults')}
      </BigButton>
      <BigButton icon="🖨️" onClick={() => navigate('/f/slip')}>
        {t('results.toSlip')}
      </BigButton>
    </Page>
  )
}
