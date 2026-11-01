// Register a farmer: consent first, then name and village, then the questions, then save.
// The record gets a device-made Haqdaar ID and a suggested follow-up date.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ApplicationStatus, Answers, FarmerRecord } from '../../shared/types'
import QuestionFlow from '../../shared/QuestionFlow'
import { evaluateAll, SCHEMES } from '../../engine/evaluate'
import { suggestFollowUpDate } from '../../engine/deadlines'
import { makeHaqdaarId } from '../../engine/haqdaarId'
import { useI18n } from '../../shared/i18n'
import { todayString } from '../../shared/dates'
import { BigButton, ListenButton, Page } from '../../shared/ui'
import { saveFarmer } from '../firebase/farmers'
import { useOperatorData } from './context'
import DetailsForm from './DetailsForm'

type Step = 'consent' | 'declined' | 'details' | 'questions' | 'saveFailed'

export default function Register() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const { user } = useOperatorData()
  const [step, setStep] = useState<Step>('consent')
  const [consentAt, setConsentAt] = useState(0)
  const [details, setDetails] = useState({ name: '', village: '' })

  function save(answers: Answers) {
    const today = todayString()
    const now = Date.now()
    const statuses: Record<string, ApplicationStatus> = Object.fromEntries(SCHEMES.map((s) => [s.id, 'not_started']))
    const record: FarmerRecord = {
      haqdaarId: makeHaqdaarId(),
      name: details.name,
      village: details.village,
      answers,
      statuses,
      followUpDate: suggestFollowUpDate(evaluateAll(answers, today), today),
      lang,
      consentAt,
      operatorId: user.uid,
      createdAt: now,
      updatedAt: now,
    }
    // Not awaited: it saves on the phone at once and syncs when internet returns.
    if (saveFarmer(record)) navigate(`/o/farmer/${record.haqdaarId}`, { replace: true })
    else setStep('saveFailed')
  }

  if (step === 'consent') {
    return (
      <Page title={t('reg.consent.title')}>
        <p className="text-lg">{t('reg.consent.text')}</p>
        <ListenButton text={t('reg.consent.text')} />
        <BigButton
          icon="✅"
          variant="primary"
          onClick={() => {
            setConsentAt(Date.now())
            setStep('details')
          }}
        >
          {t('reg.consent.yes')}
        </BigButton>
        <BigButton icon="✋" onClick={() => setStep('declined')}>
          {t('reg.consent.no')}
        </BigButton>
      </Page>
    )
  }

  if (step === 'declined' || step === 'saveFailed') {
    const key = step === 'declined' ? 'reg.consent.declined' : 'reg.saveFailed'
    return (
      <Page title={t(key)}>
        <BigButton icon="🏠" onClick={() => navigate('/o')}>
          {t('detail.back')}
        </BigButton>
      </Page>
    )
  }

  if (step === 'details') {
    return (
      <Page title={t('reg.details.title')}>
        <DetailsForm
          nameRequired
          onDone={(name, village) => {
            setDetails({ name, village })
            setStep('questions')
          }}
        />
      </Page>
    )
  }

  return (
    <Page title={details.name}>
      <QuestionFlow onDone={save} />
    </Page>
  )
}
