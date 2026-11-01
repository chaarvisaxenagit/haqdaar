// Loads every translation file into the app bundle, so all text works offline.
// A new language folder in src/i18n/ is picked up here with no code change.
import { BASE_LANG } from './languages'

type Strings = Record<string, string>

const files = import.meta.glob<Strings>('../i18n/*/*.json', { eager: true, import: 'default' })

// { hi: { "q.land.text": "...", ... }, bn: {...} }
export const TRANSLATIONS: Record<string, Strings> = {}
for (const [path, strings] of Object.entries(files)) {
  const code = path.split('/')[2]
  TRANSLATIONS[code] = { ...TRANSLATIONS[code], ...strings }
}

// Look in the chosen language, then Hindi, then show the key itself
// (so missing text is easy to spot). {name} in the text is filled from vars.
export function translate(lang: string, key: string, vars?: Record<string, string | number>): string {
  let text = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS[BASE_LANG]?.[key] ?? key
  if (vars) {
    for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value))
  }
  return text
}
