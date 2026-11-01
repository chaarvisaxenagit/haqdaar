// Farmer detail: results with reasons, application status per scheme, follow-up date,
// Print slip, edit answers/details, and Delete record (farmer withdrew consent).
// Results are worked out again from the saved answers each time.
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ApplicationStatus } from '../../shared/types'
import { evaluateAll } from '../../engine/evaluate'
import { useI18n } from '../../shared/i18n'
import { todayString } from '../../shared/dates'
import SchemeCard from '../../shared/SchemeCard'
import { BigButton, ListenButton, Nav, Page } from '../../shared/ui'
import QuestionFlow from '../../shared/QuestionFlow'
import { NextDeadlineBanner } from '../farmer/Results'
import { deleteFarmer, updateFarmer, useFarmer } from '../firebase/farmers'
import DetailsForm from './DetailsForm'

const APP_STATUSES: ApplicationStatus[] = ['not_started', 'documents_ready', 'applied', 'approved', 'rejected']

// What the page shows: the farmer, or one of the edit screens.
type Screen = 'view' | 'editAnswers' | 'editDetails' | 'confirmDelete'

export default function FarmerDetail() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const { record, ready } = useFarmer(id)
  const [screen, setScreen] = useState<Screen>('view')

  if (!ready) return <Page title={t('op.loading')} />

  if (!record) {
    return (
      <Page title={t('detail.notFound')}>
        <Nav back={{ label: t('detail.back'), onClick: () => navigate('/o') }} />
      </Page>
    )
  }

  if (screen === 'confirmDelete') {
    return (
      <main className="is-narrow">
        <div className="consent-box">
          <div className="tile3d big" aria-hidden="true">
            🗑️
          </div>
          <h1>{t('detail.deleteConfirmTitle')}</h1>
          <p>{t('detail.deleteConfirmText')}</p>
          <ListenButton text={`${t('detail.deleteConfirmTitle')} ${t('detail.deleteConfirmText')}`} />
          <BigButton
            icon="🗑️"
            variant="danger"
            onClick={() => {
              deleteFarmer(record.haqdaarId)
              navigate('/o', { replace: true })
            }}
          >
            {t('delete.yes')}
          </BigButton>
          <BigButton icon="↩️" onClick={() => setScreen('view')}>
            {t('delete.no')}
          </BigButton>
        </div>
      </main>
    )
  }

  // Fix a wrong answer: the same questions, starting from the saved answers.
  if (screen === 'editAnswers') {
    return (
      <main className="is-narrow">
        <QuestionFlow
          who={`🧑‍🌾 ${record.name}`}
          initial={record.answers}
          onBack={() => setScreen('view')}
          onDone={(answers) => {
            updateFarmer(record.haqdaarId, { answers })
            setScreen('view')
          }}
        />
      </main>
    )
  }

  if (screen === 'editDetails') {
    return (
      <Page title={t('detail.editDetails')}>
        <DetailsForm
          nameRequired
          initialName={record.name}
          initialVillage={record.village ?? ''}
          submitKey="reg.save"
          onDone={(name, village) => {
            updateFarmer(record.haqdaarId, { name, village })
            setScreen('view')
          }}
        />
        <Nav back={{ label: t('detail.cancel'), onClick: () => setScreen('view') }} />
      </Page>
    )
  }

  const today = todayString()
  const results = evaluateAll(record.answers, today)

  return (
    <main className="is-wide">
      <h1>🧑‍🌾 {record.name}</h1>
      <p className="who">
        {record.village ? `${record.village} · ` : ''}
        <span className="mono">{record.haqdaarId}</span>
      </p>
      <NextDeadlineBanner results={results} today={today} />

      <label className="field">
        📅 {t('detail.followUp')}
        <input
          className="search"
          type="date"
          value={record.followUpDate}
          onChange={(e) => updateFarmer(record.haqdaarId, { followUpDate: e.target.value })}
        />
      </label>

      <div className="grid">
        {results.map((r, i) => (
          <SchemeCard key={r.schemeId} result={r} today={today} i={i}>
            <label className="status-pick">
              {t('detail.appStatus')}
              <select
                value={record.statuses[r.schemeId] ?? 'not_started'}
                onChange={(e) =>
                  updateFarmer(record.haqdaarId, {
                    statuses: { ...record.statuses, [r.schemeId]: e.target.value as ApplicationStatus },
                  })
                }
              >
                {APP_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`appStatus.${s}`)}
                  </option>
                ))}
              </select>
            </label>
          </SchemeCard>
        ))}
      </div>

      <p className="demo-note">{t('results.likelyNote')}</p>
      <div className="actions">
        <BigButton icon="🧾" variant="primary" onClick={() => navigate(`/o/farmer/${record.haqdaarId}/slip`)}>
          {t('detail.printSlip')}
        </BigButton>
        <BigButton icon="✏️" onClick={() => setScreen('editAnswers')}>
          {t('detail.editAnswers')}
        </BigButton>
        <BigButton icon="📝" onClick={() => setScreen('editDetails')}>
          {t('detail.editDetails')}
        </BigButton>
        <BigButton icon="🗑️" onClick={() => setScreen('confirmDelete')}>
          {t('detail.delete')}
        </BigButton>
      </div>
      <Nav back={{ label: t('detail.back'), onClick: () => navigate('/o') }} />
    </main>
  )
}
