// Start screen: farm picture, name, the two big choices, and "How it works".
// The language switch is in the top bar on every page.
import type { CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../shared/i18n'
import { BigButton } from '../shared/ui'
import FarmScene from '../shared/ui/FarmScene'

export default function Start() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const chips = ['start.chip.offline', 'start.chip.listen', 'start.chip.rules']
  return (
    <main className="is-narrow">
      <section className="hero">
        <FarmScene />
        <h1 className="logo">{t('app.name')}</h1>
        <div className="logo-en">Haqdaar</div>
        <p className="tagline">{t('start.tagline')}</p>
        <p className="sub">{t('start.sub')}</p>
        <ul className="chips">
          {chips.map((k, i) => (
            <li key={k} style={{ '--i': i + 2 } as CSSProperties}>
              {t(k)}
            </li>
          ))}
        </ul>
      </section>
      <BigButton icon="👨‍🌾" variant="primary" big onClick={() => navigate('/f')}>
        {t('start.farmer')}
      </BigButton>
      <BigButton icon="🏢" big onClick={() => navigate('/o/login')}>
        {t('start.operator')}
      </BigButton>
      <Link to="/about" className="link-center">
        {t('start.about')}
      </Link>
    </main>
  )
}
