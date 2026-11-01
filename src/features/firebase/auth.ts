// Operator accounts: sign-in, new account, password reset, sign-out (email + password).
// These talk to the server, so they need internet. It is fine to wait for them (they are not Firestore writes).
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from './init'

export async function signInOperator(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password)
  return result.user
}

// A new CSC / panchayat / agriculture worker makes their own account.
// Each account sees only its own farmers (firestore.rules), so accounts cannot see each other's data.
export async function createOperatorAccount(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password)
  return result.user
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
  useEffect(() => onAuthStateChanged(auth, (user) => setState({ user, ready: true })), [])
  return state
}
