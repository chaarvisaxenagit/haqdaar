// The list of languages.
// A language shows in the picker only when live is true.
// live: true only after a native speaker has checked every line (Golden rule 14).
// bn, mr, pa, ta, te: set live on 1 Nov 2026 on the builder's decision (checked by Chaarvi Saxena).
// To add a language: make the folder src/i18n/<code>/ with the five files, then set live here.

export interface Language {
  code: string // folder name in src/i18n
  name: string // the language's name in its own script
  speechCode: string // for the Listen button
  rtl?: boolean // written right to left
  live: boolean
}

export const BASE_LANG = 'hi'

export const LANGUAGES: Language[] = [
  { code: 'hi', name: 'हिन्दी', speechCode: 'hi-IN', live: true },
  { code: 'en', name: 'English', speechCode: 'en-IN', live: true },
  { code: 'bn', name: 'বাংলা', speechCode: 'bn-IN', live: true },
  { code: 'mr', name: 'मराठी', speechCode: 'mr-IN', live: true },
  { code: 'te', name: 'తెలుగు', speechCode: 'te-IN', live: true },
  { code: 'ta', name: 'தமிழ்', speechCode: 'ta-IN', live: true },
  { code: 'gu', name: 'ગુજરાતી', speechCode: 'gu-IN', live: false },
  { code: 'kn', name: 'ಕನ್ನಡ', speechCode: 'kn-IN', live: false },
  { code: 'ml', name: 'മലയാളം', speechCode: 'ml-IN', live: false },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN', live: true },
  { code: 'or', name: 'ଓଡ଼ିଆ', speechCode: 'or-IN', live: false },
  { code: 'as', name: 'অসমীয়া', speechCode: 'as-IN', live: false },
  { code: 'ur', name: 'اردو', speechCode: 'ur-IN', rtl: true, live: false },
]

export const LIVE_LANGUAGES = LANGUAGES.filter((l) => l.live)

// The five translation files every language folder must have.
export const I18N_FILES = ['common', 'farmer', 'operator', 'engine', 'slip'] as const

export function getLanguage(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]
}
