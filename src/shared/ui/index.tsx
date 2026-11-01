// Small shared building blocks: big buttons, the Listen button, status badge, cards, top bar.
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { SchemeStatus } from '../types'
import { useI18n } from '../i18n'
import { LIVE_LANGUAGES } from '../languages'

// A big full-width tap button (at least 56 px tall) with an icon and text.
export function BigButton({
  icon,
  children,
  onClick,
  selected = false,
  variant = 'plain',
}: {
  icon?: string
  children: ReactNode
  onClick: () => void
  selected?: boolean
  variant?: 'plain' | 'primary' | 'danger'
}) {
  const look =
    variant === 'primary'
      ? 'border-green-800 bg-green-700 text-white active:bg-green-800'
      : variant === 'danger'
        ? 'border-red-800 bg-red-700 text-white active:bg-red-800'
        : selected
          ? 'border-green-700 bg-green-50 text-gray-900'
          : 'border-gray-400 bg-white text-gray-900 active:bg-gray-100'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={variant === 'plain' ? selected : undefined}
      className={`flex min-h-14 w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-start text-lg font-medium ${look}`}
    >
      {icon && <span className="text-2xl" aria-hidden="true">{icon}</span>}
      <span className="flex-1">{children}</span>
      {selected && <span aria-hidden="true">✅</span>}
    </button>
  )
}

// Reads the given text aloud in the chosen language. Works offline if the voice is installed.
export function ListenButton({ text }: { text: string }) {
  const { t, speak, voiceMissing } = useI18n()
  return (
    <div className="flex flex-col items-start gap-1 print:hidden">
      <button
        type="button"
        onClick={() => speak(text)}
        className="flex min-h-14 items-center gap-2 rounded-full bg-green-700 px-5 text-lg font-medium text-white active:bg-green-800"
      >
        <span aria-hidden="true">🔊</span>
        {t('listen')}
      </button>
      {voiceMissing && <p className="text-base text-gray-800">{t('voice.missing')}</p>}
    </div>
  )
}

// Status words always come with an icon and text, never colour alone.
export const STATUS_ICON: Record<SchemeStatus, string> = {
  likely_eligible: '✅',
  likely_not_eligible: '❌',
  check_office: '❓',
  already_have: '☑️',
}

const STATUS_LOOK: Record<SchemeStatus, string> = {
  likely_eligible: 'border-green-700 bg-green-50 text-green-900',
  likely_not_eligible: 'border-red-700 bg-red-50 text-red-900',
  check_office: 'border-amber-600 bg-amber-50 text-amber-900',
  already_have: 'border-blue-700 bg-blue-50 text-blue-900',
}

export function StatusBadge({ status }: { status: SchemeStatus }) {
  const { t } = useI18n()
  return (
    <span className={`inline-flex items-center gap-2 rounded-lg border-2 px-3 py-1 text-lg font-bold ${STATUS_LOOK[status]}`}>
      <span aria-hidden="true">{STATUS_ICON[status]}</span>
      {t(`status.${status}`)}
    </span>
  )
}

export function Card({ children }: { children: ReactNode }) {
  return <section className="flex flex-col gap-3 rounded-2xl border-2 border-gray-300 bg-white p-4">{children}</section>
}

// Standard page box: phone width first, a title, then the content.
export function Page({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </main>
  )
}

// Top bar on every page: app name (goes to start) and the language switch.
export function TopBar() {
  const { t, lang, setLang } = useI18n()
  return (
    <header className="border-b-2 border-gray-200 bg-white print:hidden">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-2 px-4 py-2">
        <Link to="/" className="flex min-h-12 items-center text-xl font-bold text-green-800">
          {t('app.name')}
        </Link>
        <label className="flex items-center gap-2 text-base">
          <span aria-hidden="true">🌐</span>
          <span className="sr-only">{t('lang.choose')}</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="min-h-12 rounded-lg border-2 border-gray-400 bg-white px-2 text-lg"
          >
            {LIVE_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  )
}

// "आपकी हक़दार आईडी: HQ-7K2M9QXA". The ID never breaks across two lines.
export function HaqdaarIdLine({ id }: { id: string }) {
  const { t } = useI18n()
  return (
    <p className="text-lg font-bold">
      {t('results.haqdaarId')}: <span className="whitespace-nowrap">{id}</span>
    </p>
  )
}
