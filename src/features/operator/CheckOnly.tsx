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
import Slip from '../slip/Slip'
import { MoneyCard } from '../farmer/Results'
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
  const { t, lang } = useI18n()
  const [showSlip, setShowSlip] = useState(false)
  const [step, setStep] = useState<Step>(lastCheck ? 'results' : 'start')
  const [details, setDetails] = useState({ name: '', village: '' })
  const [check, setCheck] = useState<CheckOnlyFarmer | null>(lastCheck)

  const note = <div className="banner warn">⚠️ {t('check.note')}</div>

  if (step === 'start') {
    return (
      <main className="is-narrow">
        <div className="consent-box">
          <div className="tile3d big" aria-hidden="true">
            🔍
          </div>
          <h1>{t('check.title')}</h1>
          <p>{t('check.note')}</p>
          <BigButton icon="🔍" variant="leaf" onClick={() => setStep('details')}>
            {t('check.start')}
          </BigButton>
        </div>
      </main>
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
      <main className="is-narrow">
        <QuestionFlow
          who={details.name ? `🧑‍🌾 ${details.name}` : undefined}
          onBack={() => setStep('details')}
          onDone={(answers) => {
            const done = { haqdaarId: makeHaqdaarId(), ...details, answers }
            lastCheck = done
            setCheck(done)
            setStep('results')
          }}
        />
      </main>
    )
  }

  if (showSlip) return <Slip farmer={{ ...check, lang }} onBack={() => setShowSlip(false)} />

  const today = todayString()
  const results = evaluateAll(check.answers, today)
  return (
    <main className="is-wide">
      {note}
      <h1>{check.name || t('check.title')}</h1>
      <HaqdaarIdLine id={check.haqdaarId} />
      <MoneyCard results={results} />
      <div className="grid">
        {results.map((r, i) => (
          <SchemeCard key={r.schemeId} result={r} today={today} i={i} />
        ))}
      </div>
      <p className="demo-note">{t('results.likelyNote')}</p>
      <div className="actions">
        <BigButton icon="🧾" variant="primary" onClick={() => setShowSlip(true)}>
          {t('detail.printSlip')}
        </BigButton>
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
      </div>
    </main>
  )
}
