// How it works / About: a simple diagram, key points, every scheme's official link and
// last-checked date, "likely eligible, the department decides", the privacy promise and the team.
import { useNavigate } from 'react-router-dom'
import { SCHEMES } from '../engine/evaluate'
import { useI18n } from '../shared/i18n'
import { formatDate } from '../shared/dates'
import { siteName } from '../shared/SchemeCard'
import { ListenButton, Nav } from '../shared/ui'

export default function About() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const points = ['about.point.system', 'about.point.rules', 'about.point.offline', 'about.point.newState']
  const privacy = ['about.privacy.phone', 'about.privacy.never', 'about.privacy.operator']

  return (
    <main className="is-narrow">
      <h1>{t('page.about.title')}</h1>
      <p className="muted">{t('about.intro')}</p>

      <div className="flow" aria-label={t('page.about.title')}>
        <div className="who-row">
          <div className="box">{t('about.flow.farmerPhone')}</div>
          <span className="or">{t('about.flow.or')}</span>
          <div className="box">{t('about.flow.operator')}</div>
        </div>
        <div className="arrow" aria-hidden="true">
          ⬇
        </div>
        <div className="box device">
          {t('about.flow.device')}
          <div className="steps">
            <span>{t('about.flow.questions')}</span>
            <span>⬇ {t('about.flow.engine')}</span>
            <span>⬇ {t('about.flow.outputs')}</span>
          </div>
        </div>
        <div className="arrow" aria-hidden="true">
          ⬇
        </div>
        <div className="box cloud">
          {t('about.flow.cloud')}
          <div className="small muted">{t('about.flow.cloudNote')}</div>
        </div>
      </div>

      <ul className="bullets">
        {points.map((k) => (
          <li key={k}>{t(k)}</li>
        ))}
      </ul>

      <h2>⚖️ {t('about.likely.title')}</h2>
      <p>{t('about.likely.text')}</p>
      <ListenButton text={`${t('about.likely.title')}. ${t('about.likely.text')}`} />

      <h2>📚 {t('about.sources.title')}</h2>
      <ul className="bullets">
        {SCHEMES.map((s) => (
          <li key={s.id}>
            <b>{t(s.nameKey)}</b>
            <br />
            <a href={s.sourceUrl} target="_blank" rel="noreferrer">
              {siteName(s.sourceUrl)}
            </a>{' '}
            · <span className="small muted">{t('results.checkedOn', { date: formatDate(s.lastVerified, t) })}</span>
          </li>
        ))}
      </ul>
      <p className="small muted">{t('about.district')}</p>

      <h2>🔒 {t('about.privacy.title')}</h2>
      <ul className="bullets">
        {privacy.map((k) => (
          <li key={k}>{t(k)}</li>
        ))}
      </ul>

      <p>
        <b>{t('slip.footer.free')}</b>
      </p>
      <p>📞 {t('slip.footer.helplines')}</p>
      <p className="small muted">{t('about.team')}</p>
      <p className="small muted">{t('about.members')}</p>

      <Nav back={{ label: t('nav.back'), onClick: () => navigate('/') }} />
    </main>
  )
}
