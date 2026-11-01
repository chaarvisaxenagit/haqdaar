// All screens and their addresses.
// HashRouter makes addresses look like /#/f/results, so refresh never gives a 404.
import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { I18nProvider } from './shared/i18n'
import { AppShell } from './shared/ui'
import ErrorBoundary from './shared/ErrorBoundary'
import Start from './pages/Start'
import Placeholder from './pages/Placeholder'
import About from './pages/About'
import FarmerHome from './features/farmer/FarmerHome'
import Questions from './features/farmer/Questions'
import Results from './features/farmer/Results'
import Checklist from './features/farmer/Checklist'
import { FarmerSlipPage } from './features/slip/SlipPages'

// Operator screens use Firebase. They load only when an #/o page opens,
// so farmer mode never starts Firebase. (Still saved for offline use by the PWA.)
const Login = lazy(() => import('./features/operator/Login'))
const OperatorGate = lazy(() => import('./features/operator/OperatorGate'))
const Dashboard = lazy(() => import('./features/operator/Dashboard'))
const Register = lazy(() => import('./features/operator/Register'))
const FarmerDetail = lazy(() => import('./features/operator/FarmerDetail'))
const OperatorSlipPage = lazy(() => import('./features/slip/OperatorSlipPage'))
const TryCheckOnly = lazy(() => import('./features/operator/TryCheckOnly'))

export default function App() {
  return (
    <I18nProvider>
      <HashRouter>
        <AppShell>
          <ErrorBoundary>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Start />} />

                {/* Farmer mode */}
                <Route path="/f" element={<FarmerHome />} />
                <Route path="/f/questions" element={<Questions />} />
                <Route path="/f/results" element={<Results />} />
                <Route path="/f/checklist" element={<Checklist />} />
                <Route path="/f/slip" element={<FarmerSlipPage />} />

                {/* Operator mode. Every screen except login needs sign-in (OperatorGate). */}
                <Route path="/o/login" element={<Login />} />
                {/* Try operator mode without an account. Nothing is saved. */}
                <Route path="/o/check" element={<TryCheckOnly />} />
                <Route path="/o" element={<OperatorGate />}>
                  <Route index element={<Dashboard />} />
                  <Route path="new" element={<Register />} />
                  <Route path="farmer/:id" element={<FarmerDetail />} />
                  <Route path="farmer/:id/slip" element={<OperatorSlipPage />} />
                </Route>

                <Route path="/about" element={<About />} />
                <Route path="*" element={<Placeholder titleKey="page.notFound" />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AppShell>
      </HashRouter>
    </I18nProvider>
  )
}
