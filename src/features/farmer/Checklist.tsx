// Checklist: papers to bring for each scheme that is likely eligible or "check with office", with tips.
import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { evaluateAll } from '../../engine/evaluate'
import { useI18n } from '../../shared/i18n'
import { todayString } from '../../shared/dates'
import { SCHEME_BY_ID } from '../../shared/SchemeCard'
import { BigButton, ListenButton, SchemeIcon } from '../../shared/ui'
import { getCurrent } from './storage'

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
  const total = withDocs.reduce((n, r) => n + r.documents.length, 0)
  const done = Object.values(ticked).filter(Boolean).length

  return (
    <main className="is-wide">
      <h1>{t('page.checklist.title')}</h1>
      {current.haqdaarId && (
        <p className="who">
          {t('results.haqdaarId')}: <span className="mono">{current.haqdaarId}</span>
        </p>
      )}
      <p className="muted">{withDocs.length > 0 ? t('checklist.intro') : t('checklist.none')}</p>
      {total > 0 && (
        <p className="docs-progress" aria-live="polite">
          {t('checklist.progress', { done, total })}
        </p>
      )}

      <div className="grid">
        {withDocs.map((r, i) => {
          const scheme = SCHEME_BY_ID[r.schemeId]
          const name = t(scheme.nameKey)
          const spoken = [name, ...r.documents.map((k) => t(k)), ...r.tips.map((k) => t(k))].join('. ')
          return (
            <section key={r.schemeId} className="docs-group" style={{ '--i': i } as CSSProperties}>
              <h3 className="docs-head">
                <SchemeIcon schemeId={scheme.id} icon={scheme.icon} small i={i} /> {name}
              </h3>
              {r.documents.map((k) => {
                const id = `${r.schemeId}:${k}`
                return (
                  <label key={k} className="check">
                    <input
                      type="checkbox"
                      checked={!!ticked[id]}
                      onChange={(e) => setTicked({ ...ticked, [id]: e.target.checked })}
                    />
                    <span>{t(k)}</span>
                  </label>
                )
              })}
              {r.tips.map((k) => (
                <p key={k} className="tip">
                  💡 {t(k)}
                </p>
              ))}
              <ListenButton text={spoken} />
            </section>
          )
        })}
      </div>

      <div className="actions">
        <BigButton icon="🧾" variant="primary" onClick={() => navigate('/f/slip')}>
          {t('results.toSlip')}
        </BigButton>
        <BigButton icon="📋" onClick={() => navigate('/f/results')}>
          {t('home.seeResults')}
        </BigButton>
      </div>
    </main>
  )
}
