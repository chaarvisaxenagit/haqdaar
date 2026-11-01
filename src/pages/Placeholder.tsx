// A simple page for addresses that do not exist.
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../shared/i18n'
import { BigButton, Page } from '../shared/ui'

export default function Placeholder({ titleKey }: { titleKey: string }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  return (
    <Page title={t(titleKey)}>
      <BigButton icon="🏠" variant="primary" narrow onClick={() => navigate('/')}>
        {t('nav.home')}
      </BigButton>
    </Page>
  )
}
