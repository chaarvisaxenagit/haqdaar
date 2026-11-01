// Checks the translation files: every live language has the same keys as Hindi.
import { describe, expect, it } from 'vitest'
import { I18N_FILES, LIVE_LANGUAGES } from './languages'
import { TRANSLATIONS, translate } from './translations'

const files = import.meta.glob<Record<string, string>>('../i18n/*/*.json', { eager: true, import: 'default' })

describe('translations', () => {
  it('Hindi is live', () => {
    expect(LIVE_LANGUAGES.map((l) => l.code)).toContain('hi')
  })

  it('every live language has all five files with exactly the Hindi keys', () => {
    for (const lang of LIVE_LANGUAGES) {
      for (const f of I18N_FILES) {
        const hi = files[`../i18n/hi/${f}.json`]
        const other = files[`../i18n/${lang.code}/${f}.json`]
        expect(other, `${lang.code}/${f}.json`).toBeDefined()
        expect(Object.keys(other).sort()).toEqual(Object.keys(hi).sort())
      }
    }
  })

  it('t() falls back to Hindi, then to the key itself', () => {
    expect(translate('gu', 'listen')).toBe(TRANSLATIONS.hi.listen)
    expect(translate('hi', 'no.such.key')).toBe('no.such.key')
    expect(translate('hi', 'progress.question', { n: 3, total: 10 })).toBe('प्रश्न 3 / 10')
  })
})
