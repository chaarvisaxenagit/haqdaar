// Operator sign-in and sign-out (email + password). First sign-in needs internet.
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from './init'

// Sign-in talks to the server, so it is fine to wait for it (it is not a Firestore write).
export async function signInOperator(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password)
  return result.user
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
