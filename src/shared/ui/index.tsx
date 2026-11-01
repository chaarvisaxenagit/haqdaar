// Small shared building blocks: big buttons, the Listen button, a page box.
import type { ReactNode } from 'react'
import { useI18n } from '../i18n'

// A big full-width tap button (at least 56 px tall) with an icon and text.
export function BigButton({
  icon,
  children,
  onClick,
  selected = false,
}: {
  icon?: string
  children: ReactNode
  onClick: () => void
  selected?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-14 w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-start text-lg font-medium ${
        selected ? 'border-green-700 bg-green-50' : 'border-gray-300 bg-white active:bg-gray-100'
      }`}
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
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => speak(text)}
        className="flex min-h-12 items-center gap-2 rounded-full bg-green-700 px-5 text-lg font-medium text-white active:bg-green-800"
      >
        <span aria-hidden="true">🔊</span>
        {t('listen')}
      </button>
      {voiceMissing && <p className="text-base text-gray-700">{t('voice.missing')}</p>}
    </div>
  )
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
