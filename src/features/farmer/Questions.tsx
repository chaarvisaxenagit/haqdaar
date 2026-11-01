// Farmer questions: the 10 question screens, then "Save on this phone?".
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Answers } from '../../shared/types'
import QuestionFlow from '../../shared/QuestionFlow'
import { useI18n } from '../../shared/i18n'
import { BigButton, ListenButton, Page } from '../../shared/ui'
import { loadRecord, makeFarmerRecord, saveRecord, setCurrent } from './storage'

export default function Questions() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Answers | null>(null)

  if (!answers) {
    return (
      <Page title={t('page.questions.title')}>
        <QuestionFlow onDone={setAnswers} />
      </Page>
    )
  }

  // No consent = no save. Results still show for this visit.
  function answerConsent(yes: boolean) {
    if (!answers) return
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

  const consentText = `${t('consent.title')} ${t('consent.text')}`
  return (
    <Page title={t('consent.title')}>
      <p className="text-lg">{t('consent.text')}</p>
      <ListenButton text={consentText} />
      <BigButton icon="💾" variant="primary" onClick={() => answerConsent(true)}>
        {t('consent.yes')}
      </BigButton>
      <BigButton icon="👀" onClick={() => answerConsent(false)}>
        {t('consent.no')}
      </BigButton>
    </Page>
  )
}
