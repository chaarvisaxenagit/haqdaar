// Start screen: language picker + "I am a farmer" + "Operator sign-in".
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../shared/i18n'
import { LIVE_LANGUAGES } from '../shared/languages'
import { BigButton } from '../shared/ui'

export default function Start() {
  const { t, lang, setLang } = useI18n()
  const navigate = useNavigate()
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{t('app.name')}</h1>
        <p className="text-lg text-gray-700">{t('app.tagline')}</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">{t('lang.choose')}</h2>
        {/* Each language is written in its own script. Only live languages show. */}
        {LIVE_LANGUAGES.map((l) => (
          <BigButton key={l.code} selected={lang === l.code} onClick={() => setLang(l.code)}>
            {l.name}
          </BigButton>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <BigButton icon="👩‍🌾" onClick={() => navigate('/f')}>
          {t('start.farmer')}
        </BigButton>
        <BigButton icon="🧑‍💼" onClick={() => navigate('/o/login')}>
          {t('start.operator')}
        </BigButton>
      </section>

      <Link to="/about" className="text-lg font-medium text-green-800 underline">
        {t('start.about')}
      </Link>
    </main>
  )
}
