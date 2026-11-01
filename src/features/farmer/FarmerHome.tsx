// Farmer home: See my results, Start again, Delete my data (with an in-app confirm screen).
// With no saved profile it goes straight to the questions.
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useI18n } from '../../shared/i18n'
import { BigButton, HaqdaarIdLine, ListenButton, Page } from '../../shared/ui'
import { deleteFarmerData, loadRecord } from './storage'

type Screen = 'home' | 'confirmDelete' | 'deleted'

export default function FarmerHome() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('home')
  const [record] = useState(loadRecord)

  if (screen === 'deleted') {
    return (
      <Page title={t('delete.done')}>
        <ListenButton text={t('delete.done')} />
        <BigButton icon="🏠" onClick={() => navigate('/')}>
          {t('nav.home')}
        </BigButton>
      </Page>
    )
  }

  if (!record) return <Navigate to="/f/questions" replace />

  if (screen === 'confirmDelete') {
    const text = `${t('delete.confirmTitle')} ${t('delete.confirmText')}`
    return (
      <Page title={t('delete.confirmTitle')}>
        <p className="text-lg">{t('delete.confirmText')}</p>
        <ListenButton text={text} />
        <BigButton
          icon="🗑️"
          variant="danger"
          onClick={() => {
            deleteFarmerData()
            setScreen('deleted')
          }}
        >
          {t('delete.yes')}
        </BigButton>
        <BigButton icon="↩️" onClick={() => setScreen('home')}>
          {t('delete.no')}
        </BigButton>
      </Page>
    )
  }

  return (
    <Page title={t('page.farmerHome.title')}>
      <p className="text-lg">{t('home.saved')}</p>
      <HaqdaarIdLine id={record.haqdaarId} />
      <BigButton icon="📋" variant="primary" onClick={() => navigate('/f/results')}>
        {t('home.seeResults')}
      </BigButton>
      <BigButton icon="🔄" onClick={() => navigate('/f/questions')}>
        {t('home.startAgain')}
      </BigButton>
      <BigButton icon="🗑️" onClick={() => setScreen('confirmDelete')}>
        {t('home.delete')}
      </BigButton>
    </Page>
  )
}
