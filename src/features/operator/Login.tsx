// Operator sign-in, new operator account, and "forgot password". All need internet.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useI18n } from '../../shared/i18n'
import { BigButton, Page } from '../../shared/ui'
import { createOperatorAccount, sendOperatorPasswordReset, signInOperator, useOperator } from '../firebase/auth'
import { useOnline } from '../firebase/online'
import OperatorBar from './OperatorBar'

type Mode = 'signin' | 'signup'

// Turn a Firebase error into one of our translation keys.
function errorKey(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ''
  if (code.includes('network')) return 'login.error.network'
  if (code.includes('email-already-in-use')) return 'login.error.emailInUse'
  if (code.includes('weak-password')) return 'login.error.weakPassword'
  if (code.includes('too-many-requests')) return 'login.error.tooMany'
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') || code.includes('invalid-email')) {
    return 'login.error.wrong'
  }
  return 'login.error.other'
}

export default function Login() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const online = useOnline()
  const { user, ready } = useOperator()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  if (ready && user) return <Navigate to="/o" replace />

  function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setInfo('')
    const action = mode === 'signin' ? signInOperator(email, password) : createOperatorAccount(email, password)
    action
      .then(() => navigate('/o', { replace: true }))
      .catch((err) => setError(errorKey(err)))
      .finally(() => setBusy(false))
  }

  function forgotPassword() {
    setError('')
    setInfo('')
    if (!email.trim()) {
      setError('reset.needEmail')
      return
    }
    sendOperatorPasswordReset(email)
      .then(() => setInfo(t('reset.sent', { email: email.trim() })))
      .catch((err) => setError(errorKey(err)))
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
    setInfo('')
  }

  const input = 'min-h-14 w-full rounded-lg border-2 border-gray-400 bg-white px-3 text-lg'
  const link = 'min-h-14 self-start px-1 text-lg font-medium text-green-800 underline'

  return (
    <>
      <OperatorBar online={online} />
      <Page title={mode === 'signin' ? t('page.operatorLogin.title') : t('signup.title')}>
        {/* Firebase keeps data on this phone, so it must be the operator's own phone. */}
        <p className="rounded-lg border-2 border-amber-600 bg-amber-50 p-3 text-lg">⚠️ {t('login.ownPhoneNote')}</p>

        {!online && <p className="text-lg font-medium text-red-800">{t('login.needInternet')}</p>}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-lg font-medium">
            {t('login.email')}
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1 text-lg font-medium">
            {t('login.password')}
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={mode === 'signup' ? 6 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />
            {mode === 'signup' && <span className="text-base font-normal text-gray-800">{t('signup.passwordHint')}</span>}
          </label>
          {error && (
            <p role="alert" className="text-lg font-medium text-red-800">
              ❌ {t(error)}
            </p>
          )}
          {info && (
            <p role="status" className="text-lg font-medium text-green-900">
              ✅ {info}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="min-h-14 w-full rounded-xl border-2 border-green-800 bg-green-700 px-4 text-lg font-medium text-white active:bg-green-800 disabled:opacity-60"
          >
            {mode === 'signin' ? (busy ? t('login.busy') : t('login.submit')) : busy ? t('signup.busy') : t('signup.submit')}
          </button>
        </form>

        {mode === 'signin' ? (
          <>
            <button type="button" onClick={forgotPassword} className={link}>
              {t('login.forgot')}
            </button>
            <button type="button" onClick={() => switchMode('signup')} className={link}>
              {t('login.createAccount')}
            </button>
          </>
        ) : (
          <button type="button" onClick={() => switchMode('signin')} className={link}>
            {t('login.haveAccount')}
          </button>
        )}

        {!online && (
          <BigButton icon="🔍" onClick={() => navigate('/o')}>
            {t('login.checkOnly')}
          </BigButton>
        )}
      </Page>
    </>
  )
}
