// About & sources: every scheme's official link and last-checked date,
// "likely eligible, the department decides", the privacy promise and the AI-tool disclosure.
import { SCHEMES } from '../engine/evaluate'
import { useI18n } from '../shared/i18n'
import { formatDate } from '../shared/dates'
import { Card, ListenButton, Page } from '../shared/ui'

export default function About() {
  const { t } = useI18n()
  const privacy = ['about.privacy.phone', 'about.privacy.never', 'about.privacy.operator']

  return (
    <Page title={t('page.about.title')}>
      <p className="text-lg">{t('about.intro')}</p>

      <Card>
        <h2 className="text-xl font-bold">⚖️ {t('about.likely.title')}</h2>
        <p className="text-lg">{t('about.likely.text')}</p>
        <ListenButton text={`${t('about.likely.title')}. ${t('about.likely.text')}`} />
      </Card>

      <Card>
        <h2 className="text-xl font-bold">📚 {t('about.sources.title')}</h2>
        <ul className="flex flex-col gap-3">
          {SCHEMES.map((s) => (
            <li key={s.id} className="text-lg">
              <strong>
                {s.icon} {t(s.nameKey)}
              </strong>
              <br />
              <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="break-all text-green-800 underline">
                {s.sourceUrl}
              </a>
              <br />
              <span className="text-base text-gray-800">
                {t('results.lastVerified', { date: formatDate(s.lastVerified, t) })}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-base text-gray-800">{t('about.district')}</p>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">🔒 {t('about.privacy.title')}</h2>
        <ul className="list-disc ps-6 text-lg">
          {privacy.map((k) => (
            <li key={k}>{t(k)}</li>
          ))}
        </ul>
        <ListenButton text={[t('about.privacy.title'), ...privacy.map((k) => t(k))].join('. ')} />
      </Card>

      <Card>
        <h2 className="text-xl font-bold">🤖 {t('about.ai.title')}</h2>
        <p className="text-lg">{t('about.ai.text')}</p>
      </Card>

      <Card>
        <p className="text-lg font-bold">{t('slip.footer.free')}</p>
        <p className="text-lg">{t('slip.footer.helplines')}</p>
        <p className="text-base text-gray-800">{t('about.team')}</p>
      </Card>
    </Page>
  )
}
