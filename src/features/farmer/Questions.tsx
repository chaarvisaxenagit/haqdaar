// Farmer questions: the question screens, then "Save on this phone?".
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Answers } from '../../shared/types'
import QuestionFlow from '../../shared/QuestionFlow'
import { useI18n } from '../../shared/i18n'
import { BigButton, ListenButton, Nav } from '../../shared/ui'
import { loadRecord, makeFarmerRecord, saveRecord, setCurrent } from './storage'

export default function Questions() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Answers>({})
  const [askConsent, setAskConsent] = useState(false)

  if (!askConsent) {
    return (
      <main className="is-narrow">
        <QuestionFlow
          initial={answers}
          startAtEnd={Object.keys(answers).length > 0}
          onBack={() => navigate('/')}
          onDone={(a) => {
            setAnswers(a)
            setAskConsent(true)
          }}
        />
      </main>
    )
  }

  // No consent = no save. Results still show for this visit.
  function answerConsent(yes: boolean) {
    if (yes) {
      const record = makeFarmerRecord(answers, lang, loadRecord())
      const saved = saveRecord(record)
      setCurrent({ answers, haqdaarId: saved ? record.haqdaarId : undefined })
      navigate('/f/results', { state: { saveFailed: !saved } })
    } else {
      setCurrent({ answers })
      navigate('/f/results')
    }
  }

  return (
    <main className="is-narrow">
      <div className="consent-box">
        <div className="tile3d big" aria-hidden="true">
          🔒
        </div>
        <h1>{t('consent.title')}</h1>
        <p>{t('consent.text')}</p>
        <ListenButton text={`${t('consent.title')} ${t('consent.text')}`} />
        <BigButton icon="✅" variant="leaf" onClick={() => answerConsent(true)}>
          {t('consent.yes')}
        </BigButton>
        <BigButton icon="❌" onClick={() => answerConsent(false)}>
          {t('consent.no')}
        </BigButton>
      </div>
      <Nav back={{ label: t('nav.back'), onClick: () => setAskConsent(false) }} />
    </main>
  )
}
