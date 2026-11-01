// Starts Firebase for operator mode only. Farmer mode never imports this file.
// Keys come from .env (see .env.example). These web keys are not secret;
// our safety comes from firestore.rules.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

// Sign-in stays saved after the browser closes ("local" is the web default).
export const auth = getAuth(app)

// Offline saving is OFF by default on the web, so we turn on the saved local cache.
// The multiple-tab manager lets the app open in more than one tab safely.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
