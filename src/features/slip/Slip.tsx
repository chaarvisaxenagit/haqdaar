// The slip: a normal page styled like a printed A4 sheet.
// Printed with the browser's Print / Save as PDF. No PDF library, so every Indian script prints right.
// Printed in the farmer's chosen language, not the operator's.
import { useEffect, useState } from 'react'
import { toDataURL } from 'qrcode'
import type { Answers } from '../../shared/types'
import { evaluateAll, SCHEMES } from '../../engine/evaluate'
import { translate } from '../../shared/translations'
import { getLanguage } from '../../shared/languages'
import { formatDate, todayString } from '../../shared/dates'
import { SCHEME_BY_ID } from '../../shared/SchemeCard'
import { Nav, STATUS_ICON } from '../../shared/ui'

export interface SlipFarmer {
  haqdaarId: string
  name?: string
  village?: string
  answers: Answers
  lang: string
}

// Newest "last checked" date in schemes.json.
const LAST_CHECKED = SCHEMES.map((s) => s.lastVerified).sort().at(-1) ?? ''

// QR code made on the phone, offline. It holds ONLY the Haqdaar ID, no personal data.
function QrCode({ text }: { text: string }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    let live = true
    toDataURL(text, { margin: 1, width: 240, errorCorrectionLevel: 'M' })
      .then((u) => live && setUrl(u))
      .catch(console.error)
    return () => {
      live = false
    }
  }, [text])
  return <div className="qr">{url && <img src={url} alt={text} />}</div>
}

export default function Slip({ farmer, onBack }: { farmer: SlipFarmer; onBack: () => void }) {
  const t = (key: string, vars?: Record<string, string | number>) => translate(farmer.lang, key, vars)
  const fmt = (date: string) => formatDate(date, t)
  const today = todayString()
  const results = evaluateAll(farmer.answers, today)
  const canApply = results.filter((r) => r.status === 'likely_eligible' || r.status === 'check_office')

  // Deadlines of schemes that need action, soonest first.
  const deadlines = canApply
    .flatMap((r) => r.deadlines.map((d) => ({ ...d, schemeId: r.schemeId })))
    .sort((a, b) => a.date.localeCompare(b.date))
  // Notes for every scheme that is not a firm "no".
  const notes = [
    ...new Set(results.filter((r) => r.status !== 'likely_not_eligible').flatMap((r) => SCHEME_BY_ID[r.schemeId].notes)),
  ]

  return (
    <main className="is-slip" lang={farmer.lang} dir={getLanguage(farmer.lang).rtl ? 'rtl' : 'ltr'}>
      <button type="button" className="btn primary narrow-btn no-print" onClick={() => {
          // Some phone browsers have no print; the caption below explains Share → Print instead.
          try {
            window.print()
          } catch (err) {
            console.error(err)
          }
        }}
      >
        🖨️ {t('slip.print')}
      </button>

      <div className="paper">
        {/* 1. Heading, date, language */}
        <div className="paper-head">
          <div>
            <div className="brand">{t('slip.heading')}</div>
            <div>{t('slip.subtitle')}</div>
          </div>
          <div className="small" style={{ textAlign: 'end' }}>
            {t('slip.date', { date: '' })}
            <b>{fmt(today)}</b>
            <br />
            {t('slip.language', { lang: getLanguage(farmer.lang).name })}
          </div>
        </div>

        {/* 2. Haqdaar ID and QR code */}
        <div className="idrow">
          <div>
            <div className="small muted">{t('results.haqdaarId')}</div>
            <div className="hqid mono">{farmer.haqdaarId}</div>
            <div className="small muted">{t('slip.qrNote')}</div>
          </div>
          <QrCode text={farmer.haqdaarId} />
        </div>

        {/* 3. Name and village */}
        {farmer.name && (
          <div>
            {t('slip.name', { name: '' })}
            <b>{farmer.name}</b>
          </div>
        )}
        {farmer.village && (
          <div>
            {t('slip.village', { village: '' })}
            <b>{farmer.village}</b>
          </div>
        )}

        {/* 4. Each scheme with status and a one-line reason */}
        <h3>{t('slip.schemes')}</h3>
        <ul>
          {results.map((r) => (
            <li key={r.schemeId}>
              <b>{t(SCHEME_BY_ID[r.schemeId].nameKey)}</b> — {STATUS_ICON[r.status]} {t(`status.${r.status}`)}
              <br />
              <span className="muted">{t(r.reasons[0])}</span>
            </li>
          ))}
        </ul>

        {/* 5. Documents to bring, as tick boxes, per scheme */}
        {canApply.some((r) => r.documents.length > 0) && (
          <>
            <h3>{t('slip.documents')}</h3>
            {canApply
              .filter((r) => r.documents.length > 0)
              .map((r) => (
                <div key={r.schemeId}>
                  <b>{t(SCHEME_BY_ID[r.schemeId].nameKey)}</b>
                  <ul>
                    {r.documents.map((k) => (
                      <li key={k}>☐ {t(k)}</li>
                    ))}
                  </ul>
                </div>
              ))}
          </>
        )}

        {/* 6. Deadlines with dates */}
        <h3>{t('slip.deadlines')}</h3>
        <ul>
          {deadlines.length === 0 ? (
            <li>{t('slip.noDeadlines')}</li>
          ) : (
            deadlines.map((d) => (
              <li key={`${d.schemeId}-${d.labelKey}`}>
                📅 {t(d.labelKey)}: <b>{fmt(d.date)}</b>
              </li>
            ))
          )}
        </ul>

        {/* 7. Scheme notes */}
        {notes.length > 0 && (
          <>
            <h3>{t('slip.notes')}</h3>
            <ul>
              {notes.map((k) => (
                <li key={k}>⚠️ {t(k)}</li>
              ))}
            </ul>
          </>
        )}

        {/* 8. Footer */}
        <div className="slip-foot">
          <p>
            <b>{t('slip.footer.free')}</b>
          </p>
          <p>{t('slip.footer.likely')}</p>
          <p>📞 {t('slip.footer.helplines')}</p>
          <p className="muted">{t('slip.footer.lastChecked', { date: fmt(LAST_CHECKED) })}</p>
        </div>
      </div>

      <p className="caption">{t('slip.caption')}</p>
      <Nav back={{ label: t('slip.back'), onClick: onBack }} />
    </main>
  )
}
