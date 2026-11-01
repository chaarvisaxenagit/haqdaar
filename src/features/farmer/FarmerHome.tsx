// Farmer home: See my results, Start again, Delete my data (with an in-app confirm screen).
// With no saved profile it goes straight to the questions.
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useI18n } from '../../shared/i18n'
import { BigButton, ListenButton, Nav } from '../../shared/ui'
import { evaluateAll } from '../../engine/evaluate'
import { todayString } from '../../shared/dates'
import DeadlineBanner from '../deadlines/DeadlineBanner'
import { MoneyCard } from './Results'
import { deleteFarmerData, loadRecord } from './storage'

type Screen = 'home' | 'confirmDelete' | 'deleted'

export default function FarmerHome() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('home')
  const [record] = useState(loadRecord)

  if (screen === 'deleted') {
    return (
      <main className="is-narrow">
        <div className="consent-box">
          <div className="tile3d big" aria-hidden="true">
            🧹
          </div>
          <h1>{t('delete.done')}</h1>
          <ListenButton text={t('delete.done')} />
          <BigButton icon="🏠" variant="primary" onClick={() => navigate('/')}>
            {t('nav.home')}
          </BigButton>
        </div>
      </main>
    )
  }

  if (!record) return <Navigate to="/f/questions" replace />

  if (screen === 'confirmDelete') {
    return (
      <main className="is-narrow">
        <div className="consent-box">
          <div className="tile3d big" aria-hidden="true">
            🗑️
          </div>
          <h1>{t('delete.confirmTitle')}</h1>
          <p>{t('delete.confirmText')}</p>
          <ListenButton text={`${t('delete.confirmTitle')} ${t('delete.confirmText')}`} />
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
        </div>
      </main>
    )
  }

  const today = todayString()
  const results = evaluateAll(record.answers, today)

  return (
    <main className="is-narrow">
      <DeadlineBanner results={results} today={today} />
      <h1>{t('page.farmerHome.title')}</h1>
      <p className="who">
        {t('results.haqdaarId')}: <span className="mono">{record.haqdaarId}</span>
      </p>
      <p className="muted">{t('home.saved')}</p>
      <MoneyCard results={results} />
      <BigButton icon="📋" variant="primary" big onClick={() => navigate('/f/results')}>
        {t('home.seeResults')}
      </BigButton>
      <BigButton icon="🔄" onClick={() => navigate('/f/questions')}>
        {t('home.startAgain')}
      </BigButton>
      <BigButton icon="🗑️" onClick={() => setScreen('confirmDelete')}>
        {t('home.delete')}
      </BigButton>
      <Nav back={{ label: t('nav.back'), onClick: () => navigate('/') }} />
    </main>
  )
}
