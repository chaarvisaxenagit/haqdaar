// The slip: a normal page styled for printing.
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
import { STATUS_ICON } from '../../shared/ui'

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
  return url ? <img src={url} alt={text} className="size-32 shrink-0 print:size-28" /> : <div className="size-32 shrink-0" />
}

export default function Slip({ farmer, onBack }: { farmer: SlipFarmer; onBack: () => void }) {
  const t = (key: string, vars?: Record<string, string | number>) => translate(farmer.lang, key, vars)
  const fmt = (date: string) => formatDate(date, t)
  const today = todayString()
  const results = evaluateAll(farmer.answers, today)
  const canApply = results.filter((r) => r.status === 'likely_eligible' || r.status === 'check_office')

  // Papers to bring, each listed once.
  const documents = [...new Set(canApply.flatMap((r) => r.documents))]
  // Deadlines of schemes that need action, soonest first.
  const deadlines = canApply
    .flatMap((r) => r.deadlines.map((d) => ({ ...d, schemeId: r.schemeId })))
    .sort((a, b) => a.date.localeCompare(b.date))
  // Notes for every scheme that is not a firm "no".
  const notes = [
    ...new Set(results.filter((r) => r.status !== 'likely_not_eligible').flatMap((r) => SCHEME_BY_ID[r.schemeId].notes)),
  ]

  const h2 = 'mt-1 border-b-2 border-gray-800 text-xl font-bold print:text-lg'

  return (
    <main
      lang={farmer.lang}
      dir={getLanguage(farmer.lang).rtl ? 'rtl' : 'ltr'}
      className="mx-auto flex w-full max-w-2xl flex-col gap-3 bg-white px-4 py-6 text-gray-950 print:max-w-none print:p-0"
    >
      <div className="flex flex-col gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-green-800 bg-green-700 px-4 text-lg font-medium text-white active:bg-green-800"
        >
          🖨️ {t('slip.print')}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="min-h-14 w-full rounded-xl border-2 border-gray-400 bg-white px-4 text-lg font-medium"
        >
          ← {t('slip.back')}
        </button>
      </div>

      {/* 1. Heading, date, language */}
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 border-b-4 border-gray-900 pb-2">
        <h1 className="text-3xl font-bold">{t('slip.heading')}</h1>
        <p className="text-base">
          {t('slip.date', { date: fmt(today) })} · {t('slip.language', { lang: getLanguage(farmer.lang).name })}
        </p>
      </header>

      {/* 2. Haqdaar ID and QR code. 3. Name and village */}
      <section className="flex items-center gap-4 break-inside-avoid">
        <QrCode text={farmer.haqdaarId} />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-base font-medium">{t('results.haqdaarId')}</p>
          <p className="text-2xl font-bold whitespace-nowrap sm:text-3xl print:text-3xl">{farmer.haqdaarId}</p>
          {farmer.name && <p className="text-lg">{t('slip.name', { name: farmer.name })}</p>}
          {farmer.village && <p className="text-lg">{t('slip.village', { village: farmer.village })}</p>}
        </div>
      </section>

      {/* 4. Each scheme with status and a one-line reason */}
      <section className="break-inside-avoid">
        <h2 className={h2}>{t('slip.schemes')}</h2>
        <ul className="flex flex-col gap-2 pt-2">
          {results.map((r) => (
            <li key={r.schemeId} className="text-lg">
              <strong>
                {SCHEME_BY_ID[r.schemeId].icon} {t(SCHEME_BY_ID[r.schemeId].nameKey)}:
              </strong>{' '}
              {STATUS_ICON[r.status]} {t(`status.${r.status}`)}
              <br />
              <span className="text-base">{t(r.reasons[0])}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Documents to bring, as tick boxes */}
      {documents.length > 0 && (
        <section className="break-inside-avoid">
          <h2 className={h2}>{t('slip.documents')}</h2>
          <ul className="flex flex-col gap-1 pt-2">
            {documents.map((k) => (
              <li key={k} className="flex items-start gap-2 text-lg">
                <span aria-hidden="true" className="mt-1 inline-block size-5 shrink-0 border-2 border-gray-900" />
                {t(k)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 6. Deadlines with dates */}
      <section className="break-inside-avoid">
        <h2 className={h2}>{t('slip.deadlines')}</h2>
        {deadlines.length === 0 ? (
          <p className="pt-2 text-lg">{t('slip.noDeadlines')}</p>
        ) : (
          <ul className="flex flex-col gap-1 pt-2">
            {deadlines.map((d) => (
              <li key={`${d.schemeId}-${d.labelKey}`} className="text-lg">
                📅 {t(d.labelKey)}: <strong>{fmt(d.date)}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 7. Scheme notes */}
      {notes.length > 0 && (
        <section className="break-inside-avoid">
          <h2 className={h2}>{t('slip.notes')}</h2>
          <ul className="list-disc ps-6 pt-2 text-lg">
            {notes.map((k) => (
              <li key={k}>{t(k)}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 8. Footer */}
      <footer className="mt-2 flex flex-col gap-1 border-t-4 border-gray-900 pt-2 text-base break-inside-avoid">
        <p className="font-bold">{t('slip.footer.free')}</p>
        <p>{t('slip.footer.likely')}</p>
        <p>{t('slip.footer.helplines')}</p>
        <p>{t('slip.footer.lastChecked', { date: fmt(LAST_CHECKED) })}</p>
      </footer>
    </main>
  )
}
