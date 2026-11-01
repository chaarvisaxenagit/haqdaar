import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Every time the app is opened (or the page is reloaded), start on the start page.
if (window.location.hash !== '' && window.location.hash !== '#/') {
  window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
