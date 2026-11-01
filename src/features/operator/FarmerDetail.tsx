// Farmer detail: results with reasons, application status per scheme, follow-up date,
// Print slip, and Delete record (farmer withdrew consent).
// Results are worked out again from the saved answers each time.
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ApplicationStatus } from '../../shared/types'
import { evaluateAll } from '../../engine/evaluate'
import { useI18n } from '../../shared/i18n'
import { todayString } from '../../shared/dates'
import SchemeCard from '../../shared/SchemeCard'
import { BigButton, Card, HaqdaarIdLine, ListenButton, Page } from '../../shared/ui'
import QuestionFlow from '../../shared/QuestionFlow'
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
  const confirmDelete = screen === 'confirmDelete'
  const setConfirmDelete = (yes: boolean) => setScreen(yes ? 'confirmDelete' : 'view')

  if (!ready) return <Page title={t('op.loading')} />

  if (!record) {
    return (
      <Page title={t('detail.notFound')}>
        <BigButton icon="🏠" onClick={() => navigate('/o')}>
          {t('detail.back')}
        </BigButton>
      </Page>
    )
  }

  if (confirmDelete) {
    const text = `${t('detail.deleteConfirmTitle')} ${t('detail.deleteConfirmText')}`
    return (
      <Page title={t('detail.deleteConfirmTitle')}>
        <p className="text-lg">{t('detail.deleteConfirmText')}</p>
        <ListenButton text={text} />
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
        <BigButton icon="↩️" onClick={() => setConfirmDelete(false)}>
          {t('delete.no')}
        </BigButton>
      </Page>
    )
  }

  // Fix a wrong answer: the same questions, starting from the saved answers.
  if (screen === 'editAnswers') {
    return (
      <Page title={record.name}>
        <QuestionFlow
          initial={record.answers}
          onDone={(answers) => {
            updateFarmer(record.haqdaarId, { answers })
            setScreen('view')
          }}
        />
        <BigButton icon="↩️" onClick={() => setScreen('view')}>
          {t('detail.cancel')}
        </BigButton>
      </Page>
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
        <BigButton icon="↩️" onClick={() => setScreen('view')}>
          {t('detail.cancel')}
        </BigButton>
      </Page>
    )
  }

  const today = todayString()
  const results = evaluateAll(record.answers, today)
  const select = 'min-h-14 w-full rounded-lg border-2 border-gray-400 bg-white px-3 text-lg'

  return (
    <Page title={record.name}>
      <HaqdaarIdLine id={record.haqdaarId} />
      {record.village && <p className="text-lg">{t('detail.village', { village: record.village })}</p>}

      <Card>
        <label className="flex flex-col gap-1 text-lg font-bold">
          📅 {t('detail.followUp')}
          <input
            type="date"
            value={record.followUpDate}
            onChange={(e) => updateFarmer(record.haqdaarId, { followUpDate: e.target.value })}
            className={select}
          />
        </label>
      </Card>

      <BigButton icon="🖨️" variant="primary" onClick={() => navigate(`/o/farmer/${record.haqdaarId}/slip`)}>
        {t('detail.printSlip')}
      </BigButton>

      <p className="text-lg text-gray-800">{t('results.likelyNote')}</p>

      {results.map((r) => (
        <SchemeCard key={r.schemeId} result={r} today={today}>
          <label className="flex flex-col gap-1 text-lg font-bold">
            {t('detail.appStatus')}
            <select
              value={record.statuses[r.schemeId] ?? 'not_started'}
              onChange={(e) =>
                updateFarmer(record.haqdaarId, {
                  statuses: { ...record.statuses, [r.schemeId]: e.target.value as ApplicationStatus },
                })
              }
              className={select}
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

      <BigButton icon="✏️" onClick={() => setScreen('editAnswers')}>
        {t('detail.editAnswers')}
      </BigButton>
      <BigButton icon="📝" onClick={() => setScreen('editDetails')}>
        {t('detail.editDetails')}
      </BigButton>
      <BigButton icon="🏠" onClick={() => navigate('/o')}>
        {t('detail.back')}
      </BigButton>
      <BigButton icon="🗑️" onClick={() => setConfirmDelete(true)}>
        {t('detail.delete')}
      </BigButton>
    </Page>
  )
}
