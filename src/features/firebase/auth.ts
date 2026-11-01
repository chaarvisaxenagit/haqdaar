// Operator accounts: sign-in, new account, password reset, sign-out (email + password).
// These talk to the server, so they need internet. It is fine to wait for them (they are not Firestore writes).
import {
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { checkNewEmail, emailProblem } from './emailCheck'
import { auth } from './init'

// A badly written or misspelt email is stopped here too, with a "did you mean" hint,
// instead of asking Firebase about an account that should never exist.
export async function signInOperator(email: string, password: string): Promise<User> {
  const check = emailProblem(email)
  if (check && (check.problem === 'badEmail' || check.problem === 'typo')) {
    throw { code: `haqdaar/${check.problem}`, suggestion: check.suggestion }
  }
  const result = await signInWithEmailAndPassword(auth, email.trim(), password)
  return result.user
}

// A new CSC / panchayat / agriculture worker makes their own account.
// Each account sees only its own farmers (firestore.rules), so accounts cannot see each other's data.
// Fake, misspelt or badly written emails are refused here, and so are domains that cannot
// receive mail. Then Firebase sends a link to the email,
// and the account can save nothing until that link is opened (firestore.rules checks this).
export async function createOperatorAccount(email: string, password: string): Promise<User> {
  const check = await checkNewEmail(email)
  if (check) throw { code: `haqdaar/${check.problem}`, suggestion: check.suggestion }
  const result = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
  sendEmailVerification(result.user).catch(console.error)
  return result.user
}

// Sends the "confirm your email" link again.
export function resendVerification(): Promise<void> {
  if (!auth.currentUser) return Promise.reject({ code: 'auth/no-current-user' })
  return sendEmailVerification(auth.currentUser)
}

// Asks Firebase whether the link was opened. Gets a fresh sign-in token too,
// so firestore.rules sees the email as confirmed straight away.
export async function checkVerified(): Promise<boolean> {
  const user = auth.currentUser
  if (!user) return false
  await user.reload()
  if (user.emailVerified) await user.getIdToken(true)
  return user.emailVerified
}

// Sends a "reset your password" email from Firebase.
export function sendOperatorPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email.trim())
}

export function signOutOperator(): Promise<void> {
  return signOut(auth)
}

// The signed-in operator, or null. "ready" is false until Firebase has checked the saved sign-in.
export function useOperator(): { user: User | null; ready: boolean } {
  const [state, setState] = useState<{ user: User | null; ready: boolean }>({
    user: auth.currentUser,
    ready: false,
  })
  // onIdTokenChanged also fires when checkVerified() gets a fresh token, so the screen updates.
  // Safety net: if Firebase has not answered in 6 seconds, go on with what it knows,
  // so the operator never waits on "Loading…" for ever.
  useEffect(() => {
    const timer = setTimeout(() => setState((s) => (s.ready ? s : { user: auth.currentUser, ready: true })), 6000)
    const stop = onIdTokenChanged(
      auth,
      (user) => setState({ user, ready: true }),
      () => setState({ user: auth.currentUser, ready: true }),
    )
    return () => {
      clearTimeout(timer)
      stop()
    }
  }, [])
  return state
}
