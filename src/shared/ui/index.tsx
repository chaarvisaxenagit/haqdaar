// Shared building blocks: page shell, top bar, big buttons, Listen button, status, cards.
// Styles live in src/index.css.
import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { SchemeStatus } from '../types'
import { useI18n } from '../i18n'
import { LIVE_LANGUAGES } from '../languages'
import BgDrift from './BgDrift'

type Variant = 'plain' | 'primary' | 'leaf' | 'danger'

// A big full-width button (56 px or more) with an icon and text.
export function BigButton({
  icon,
  children,
  onClick,
  variant = 'plain',
  big = false,
  narrow = false,
  disabled = false,
  className = '',
}: {
  icon?: string
  children: ReactNode
  onClick: () => void
  variant?: Variant
  big?: boolean
  narrow?: boolean
  disabled?: boolean
  className?: string
}) {
  const classes = ['btn', variant !== 'plain' && variant, big && 'big', narrow && 'narrow-btn', className]
    .filter(Boolean)
    .join(' ')
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}

// Back / Next row. A lone button sits in the middle.
export function Nav({
  back,
  next,
  sticky = false,
}: {
  back?: { label: string; onClick: () => void }
  next?: { label: string; onClick: () => void; disabled?: boolean }
  sticky?: boolean
}) {
  return (
    <nav className={`nav${sticky ? ' sticky' : ''} no-print`}>
      {back && (
        <button type="button" className="btn back" onClick={back.onClick}>
          ← {back.label}
        </button>
      )}
      {next && (
        <button type="button" className="btn primary" onClick={next.onClick} disabled={next.disabled}>
          {next.label} →
        </button>
      )}
    </nav>
  )
}

// Reads the given text aloud in the chosen language. Works offline if the voice is installed.
export function ListenButton({ text }: { text: string }) {
  const { t, speak, voiceMissing } = useI18n()
  return (
    <div className="no-print">
      <button type="button" className="listen" onClick={() => speak(text)}>
        <span aria-hidden="true">🔊</span> {t('listen')}
      </button>
      {voiceMissing && <p className="voice-note">{t('voice.missing')}</p>}
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

export function StatusBadge({ status }: { status: SchemeStatus }) {
  const { t } = useI18n()
  return (
    <p className="status">
      {STATUS_ICON[status]} {t(`status.${status}`)}
    </p>
  )
}

// Raised coloured tile with the scheme's emoji.
export function SchemeIcon({ schemeId, icon, small = false, i = 0 }: { schemeId: string; icon: string; small?: boolean; i?: number }) {
  const known = ['pmkisan', 'pmfby', 'kcc', 'shc', 'soon']
  const color = known.includes(schemeId) ? `ic-${schemeId}` : 'ic-default'
  return (
    <span className={`card-icon ${color}${small ? ' small' : ''}`} style={{ '--i': i } as CSSProperties} aria-hidden="true">
      {icon}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}

// Standard page: phone width first, a title, then the content.
export function Page({
  title,
  children,
  width = 'narrow',
}: {
  title?: ReactNode
  children?: ReactNode
  width?: 'narrow' | 'wide' | 'slip'
}) {
  return (
    <main className={`is-${width}`}>
      {title && <h1>{title}</h1>}
      {children}
    </main>
  )
}

// "आपकी हक़दार आईडी: HQ-7K2M9QXA". The ID never breaks across two lines.
export function HaqdaarIdLine({ id }: { id: string }) {
  const { t } = useI18n()
  return (
    <p className="who">
      {t('results.haqdaarId')}: <span className="mono">{id}</span>
    </p>
  )
}

// Top bar on every page: home button and the language switch.
export function TopBar() {
  const { t, lang, setLang } = useI18n()
  return (
    <header className="topbar no-print">
      <Link to="/" className="home" aria-label={t('nav.home')}>
        🏠
      </Link>
      <div className="lang" role="group" aria-label={t('lang.choose')}>
        {LIVE_LANGUAGES.map((l) => (
          <button key={l.code} type="button" lang={l.code} aria-pressed={lang === l.code} onClick={() => setLang(l.code)}>
            {l.name}
          </button>
        ))}
        {/* More Indian languages come once a native speaker has checked them. */}
        <button type="button" className="soon" aria-disabled="true" title={t('lang.regionalSoon')}>
          {t('lang.regionalSoon')}
        </button>
      </div>
    </header>
  )
}

// "Works offline too" note, shown only once the app is really saved on the phone.
function OfflineNote() {
  const { t } = useI18n()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let live = true
    navigator.serviceWorker?.ready.then(() => live && setReady(true)).catch(() => {})
    return () => {
      live = false
    }
  }, [])
  if (!ready) return null
  return <span className="offline-note">{t('app.offlineReady')}</span>
}

// The app column: drifting background, top bar, the page, and the footer.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <BgDrift />
      <TopBar />
      {children}
      <footer className="foot no-print">
        <OfflineNote />
      </footer>
    </div>
  )
}
