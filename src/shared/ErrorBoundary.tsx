// Catches a screen that crashes (for example, operator mode when Firebase cannot start),
// so the rest of the app keeps working. Without this, one crash leaves every page blank.
// It resets when the address changes, so going back to another page works again.
import { Component } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from './i18n'
import { BigButton, Page } from './ui'

class Catcher extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
  }

  render() {
    return this.state.failed ? <CrashPage /> : this.props.children
  }
}

function CrashPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  return (
    <Page title="⚠️">
      <p>{t('crash.text')}</p>
      {/* Reloading also fixes a screen that could not load after the app was updated. */}
      <BigButton icon="🔄" variant="primary" narrow onClick={() => window.location.reload()}>
        {t('crash.reload')}
      </BigButton>
      <BigButton icon="🏠" narrow onClick={() => navigate('/')}>
        {t('nav.home')}
      </BigButton>
    </Page>
  )
}

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return <Catcher key={pathname}>{children}</Catcher>
}
