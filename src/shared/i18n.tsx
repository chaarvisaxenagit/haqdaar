// Language context: the chosen language, the t() function and the Listen helper.
// No i18n library.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { BASE_LANG, getLanguage, LIVE_LANGUAGES } from './languages'
import { translate } from './translations'

const LANG_KEY = 'haqdaar.v1.lang'

interface I18nValue {
  lang: string
  setLang: (code: string) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  speak: (text: string) => void
  voiceMissing: boolean
}

const I18nContext = createContext<I18nValue | null>(null)

// Read the saved language. If storage fails, just use Hindi for this visit.
function loadLang(): string {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved && LIVE_LANGUAGES.some((l) => l.code === saved)) return saved
  } catch {
    // storage blocked: ignore
  }
  return BASE_LANG
}

// ---------- Listen helper (browser speechSynthesis) ----------

function hasSpeech(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// Voices can be empty on the first call. Wait for "voiceschanged" (at most 2 seconds).
function getVoicesReady(): Promise<SpeechSynthesisVoice[]> {
  const now = speechSynthesis.getVoices()
  if (now.length > 0) return Promise.resolve(now)
  return new Promise((resolve) => {
    const done = () => {
      speechSynthesis.removeEventListener('voiceschanged', done)
      resolve(speechSynthesis.getVoices())
    }
    speechSynthesis.addEventListener('voiceschanged', done)
    setTimeout(done, 2000)
  })
}

// Find a voice for "hi-IN". Android may write it as "hi_IN".
function findVoice(voices: SpeechSynthesisVoice[], speechCode: string) {
  const want = speechCode.toLowerCase()
  const norm = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase()
  return (
    voices.find((v) => norm(v) === want) ??
    voices.find((v) => norm(v).split('-')[0] === want.split('-')[0])
  )
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState(loadLang)
  const [voiceMissing, setVoiceMissing] = useState(false)

  const setLang = useCallback((code: string) => {
    setLangState(code)
    setVoiceMissing(false)
    try {
      localStorage.setItem(LANG_KEY, code)
    } catch {
      // storage blocked: the choice still works for this visit
    }
  }, [])

  // Tell the page which language and direction it is in (Urdu is right to left).
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = getLanguage(lang).rtl ? 'rtl' : 'ltr'
  }, [lang])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  )

  const speak = useCallback(
    (text: string) => {
      if (!hasSpeech()) {
        setVoiceMissing(true)
        return
      }
      const speechCode = getLanguage(lang).speechCode
      // Stop any speech before starting new speech.
      speechSynthesis.cancel()
      getVoicesReady().then((voices) => {
        const voice = findVoice(voices, speechCode)
        // No voice installed: show a small note, keep the text on screen, never block.
        setVoiceMissing(!voice)
        if (!voice) return
        const utter = new SpeechSynthesisUtterance(text)
        utter.lang = speechCode
        utter.voice = voice
        utter.rate = 0.9
        speechSynthesis.speak(utter)
      })
    },
    [lang],
  )

  const value = useMemo(
    () => ({ lang, setLang, t, speak, voiceMissing }),
    [lang, setLang, t, speak, voiceMissing],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}
