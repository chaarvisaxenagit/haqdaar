// A simple page for screens that are not built yet.
import { Link } from 'react-router-dom'
import { useI18n } from '../shared/i18n'
import { Page } from '../shared/ui'

export default function Placeholder({ titleKey }: { titleKey: string }) {
  const { t } = useI18n()
  return (
    <Page title={t(titleKey)}>
      <p>{t('placeholder.soon')}</p>
      <Link to="/" className="text-lg font-medium text-green-800 underline">
        {t('nav.home')}
      </Link>
    </Page>
  )
}
