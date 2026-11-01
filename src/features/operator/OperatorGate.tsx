// Guards every #/o screen except login.
// - Signed in: show the screen, with the operator bar on top.
// - Signed out and online: go to the login page.
// - Signed out and offline: login cannot work, so show "Check only" mode (nothing is saved).
import { Navigate, Outlet } from 'react-router-dom'
import { useI18n } from '../../shared/i18n'
import { Page } from '../../shared/ui'
import { useOperator } from '../firebase/auth'
import { useFarmers } from '../firebase/farmers'
import { useOnline } from '../firebase/online'
import { OperatorContext } from './context'
import OperatorBar from './OperatorBar'
import CheckOnly from './CheckOnly'

export default function OperatorGate() {
  const { t } = useI18n()
  const { user, ready } = useOperator()
  const online = useOnline()
  const list = useFarmers(user?.uid ?? null)

  if (!ready) {
    return (
      <>
        <OperatorBar online={online} />
        <Page title={t('op.loading')} />
      </>
    )
  }

  if (!user) {
    if (online) return <Navigate to="/o/login" replace />
    return (
      <>
        <OperatorBar online={online} />
        <CheckOnly />
      </>
    )
  }

  return (
    <OperatorContext.Provider value={{ user, list }}>
      <OperatorBar online={online} pending={list.pending} />
      <Outlet />
    </OperatorContext.Provider>
  )
}
