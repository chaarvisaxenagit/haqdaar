// Shown to a signed-in operator whose email is not confirmed yet.
// They must open the link Firebase emailed them. Until then nothing can be saved (firestore.rules).
import { useState } from 'react'
import type { User } from 'firebase/auth'
import { useI18n } from '../../shared/i18n'
import { BigButton, Page } from '../../shared/ui'
import { checkVerified, resendVerification, signOutOperator } from '../firebase/auth'

function errorKey(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ''
  if (code.includes('network')) return 'login.error.network'
  if (code.includes('too-many-requests')) return 'login.error.tooMany'
  return 'login.error.other'
}

export default function VerifyEmail({ user }: { user: User }) {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const email = user.email ?? ''

  function check() {
    setBusy(true)
    setError('')
    setInfo('')
    checkVerified()
      .then((ok) => {
        // When confirmed, useOperator() gets the fresh token and the dashboard opens by itself.
        if (!ok) setError('verify.notYet')
      })
      .catch((err) => setError(errorKey(err)))
      .finally(() => setBusy(false))
  }

  function resend() {
    setError('')
    setInfo('')
    resendVerification()
      .then(() => setInfo(t('verify.resent', { email })))
      .catch((err) => setError(errorKey(err)))
  }

  return (
    <Page title={t('verify.title')}>
      <p>📧 {t('verify.text', { email })}</p>
      {error && (
        <p role="alert" className="error">
          ❌ {t(error)}
        </p>
      )}
      {info && (
        <p role="status" className="info">
          ✅ {info}
        </p>
      )}
      <BigButton icon="✅" variant="leaf" onClick={check}>
        {busy ? t('verify.busy') : t('verify.done')}
      </BigButton>
      <BigButton icon="🔁" onClick={resend}>
        {t('verify.resend')}
      </BigButton>
      <BigButton icon="🚪" narrow onClick={() => signOutOperator()}>
        {t('dash.signOut')}
      </BigButton>
    </Page>
  )
}
