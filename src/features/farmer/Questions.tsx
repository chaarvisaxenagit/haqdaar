// Farmer questions page. For now it runs the QuestionFlow stub and shows a "done" note.
// Saving and results come later.
import { useState } from 'react'
import QuestionFlow from '../../shared/QuestionFlow'
import { useI18n } from '../../shared/i18n'
import { Page } from '../../shared/ui'

export default function Questions() {
  const { t } = useI18n()
  const [done, setDone] = useState(false)
  return (
    <Page title={t('page.questions.title')}>
      {done ? <p className="text-lg">✅ {t('q.done.stub')}</p> : <QuestionFlow onDone={() => setDone(true)} />}
    </Page>
  )
}
