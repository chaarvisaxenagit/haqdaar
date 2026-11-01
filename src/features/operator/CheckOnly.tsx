// "Check only" mode: the operator is signed out and offline, so sign-in cannot work.
// Same questions and results, but NOTHING is saved to Firestore.
// A Haqdaar ID is still made, so the slip can be printed and the farmer registered later.
import { useState } from 'react'
import type { Answers } from '../../shared/types'
import QuestionFlow from '../../shared/QuestionFlow'
import { evaluateAll } from '../../engine/evaluate'
import { makeHaqdaarId } from '../../engine/haqdaarId'
import { useI18n } from '../../shared/i18n'
import { todayString } from '../../shared/dates'
import SchemeCard from '../../shared/SchemeCard'
import { BigButton, HaqdaarIdLine, Page } from '../../shared/ui'
import DetailsForm from './DetailsForm'

// The last check, kept in memory only (for the slip). Never saved anywhere.
export interface CheckOnlyFarmer {
  haqdaarId: string
  name: string
  village: string
  answers: Answers
}
let lastCheck: CheckOnlyFarmer | null = null
export function getLastCheck(): CheckOnlyFarmer | null {
  return lastCheck
}

type Step = 'start' | 'details' | 'questions' | 'results'

export default function CheckOnly() {
  const { t } = useI18n()
  const [step, setStep] = useState<Step>(lastCheck ? 'results' : 'start')
  const [details, setDetails] = useState({ name: '', village: '' })
  const [check, setCheck] = useState<CheckOnlyFarmer | null>(lastCheck)

  const note = <p className="rounded-lg border-2 border-amber-600 bg-amber-50 p-3 text-lg">⚠️ {t('check.note')}</p>

  if (step === 'start') {
    return (
      <Page title={t('check.title')}>
        {note}
        <BigButton icon="🔍" variant="primary" onClick={() => setStep('details')}>
          {t('check.start')}
        </BigButton>
      </Page>
    )
  }

  if (step === 'details') {
    return (
      <Page title={t('check.title')}>
        <DetailsForm
          nameRequired={false}
          onDone={(name, village) => {
            setDetails({ name, village })
            setStep('questions')
          }}
        />
      </Page>
    )
  }

  if (step === 'questions' || !check) {
    return (
      <Page title={t('check.title')}>
        <QuestionFlow
          onDone={(answers) => {
            const done = { haqdaarId: makeHaqdaarId(), ...details, answers }
            lastCheck = done
            setCheck(done)
            setStep('results')
          }}
        />
      </Page>
    )
  }

  const today = todayString()
  return (
    <Page title={check.name || t('check.title')}>
      {note}
      <HaqdaarIdLine id={check.haqdaarId} />
      <p className="text-lg text-gray-800">{t('results.likelyNote')}</p>
      {evaluateAll(check.answers, today).map((r) => (
        <SchemeCard key={r.schemeId} result={r} today={today} />
      ))}
      <BigButton
        icon="🔄"
        onClick={() => {
          lastCheck = null
          setCheck(null)
          setDetails({ name: '', village: '' })
          setStep('start')
        }}
      >
        {t('check.again')}
      </BigButton>
    </Page>
  )
}
