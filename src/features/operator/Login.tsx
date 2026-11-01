// Operator sign-in, new operator account, and "forgot password". All need internet.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useI18n } from '../../shared/i18n'
import { BigButton, Nav } from '../../shared/ui'
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

  return (
    <>
      <OperatorBar online={online} />
      <main className="is-narrow">
        <h1>{mode === 'signin' ? t('page.operatorLogin.title') : t('signup.title')}</h1>
        {!online && <div className="banner warn">📵 {t('login.needInternet')}</div>}

        <form className="login" onSubmit={submit}>
          <label className="field">
            {t('login.email')}
            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="field">
            {t('login.password')}
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={mode === 'signup' ? 6 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === 'signup' && <span className="field-hint">{t('signup.passwordHint')}</span>}
          </label>
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
          <button type="submit" className="btn primary" disabled={busy}>
            {mode === 'signin' ? (busy ? t('login.busy') : t('login.submit')) : busy ? t('signup.busy') : t('signup.submit')}
          </button>
          <p className="small">🔐 {t('login.ownPhoneNote')}</p>
          {mode === 'signin' ? (
            <>
              <button type="button" className="link-btn" onClick={forgotPassword}>
                {t('login.forgot')}
              </button>
              <button type="button" className="link-btn" onClick={() => switchMode('signup')}>
                {t('login.createAccount')}
              </button>
            </>
          ) : (
            <button type="button" className="link-btn" onClick={() => switchMode('signin')}>
              {t('login.haveAccount')}
            </button>
          )}
        </form>

        {!online && (
          <BigButton icon="🔍" variant="leaf" onClick={() => navigate('/o')}>
            {t('login.checkOnly')}
          </BigButton>
        )}
        <Nav back={{ label: t('nav.back'), onClick: () => navigate('/') }} />
      </main>
    </>
  )
}
