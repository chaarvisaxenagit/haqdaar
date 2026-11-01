// All screens and their addresses.
// HashRouter makes addresses look like /#/f/results, so refresh never gives a 404.
import { HashRouter, Route, Routes } from 'react-router-dom'
import { I18nProvider } from './shared/i18n'
import { TopBar } from './shared/ui'
import Start from './pages/Start'
import Placeholder from './pages/Placeholder'
import FarmerHome from './features/farmer/FarmerHome'
import Questions from './features/farmer/Questions'
import Results from './features/farmer/Results'
import Checklist from './features/farmer/Checklist'
import Login from './features/operator/Login'
import OperatorGate from './features/operator/OperatorGate'
import Dashboard from './features/operator/Dashboard'
import Register from './features/operator/Register'
import FarmerDetail from './features/operator/FarmerDetail'

export default function App() {
  return (
    <I18nProvider>
      <HashRouter>
        <TopBar />
        <Routes>
          <Route path="/" element={<Start />} />

          {/* Farmer mode */}
          <Route path="/f" element={<FarmerHome />} />
          <Route path="/f/questions" element={<Questions />} />
          <Route path="/f/results" element={<Results />} />
          <Route path="/f/checklist" element={<Checklist />} />
          <Route path="/f/slip" element={<Placeholder titleKey="page.slip.title" />} />

          {/* Operator mode. Every screen except login needs sign-in (OperatorGate). */}
          <Route path="/o/login" element={<Login />} />
          <Route path="/o" element={<OperatorGate />}>
            <Route index element={<Dashboard />} />
            <Route path="new" element={<Register />} />
            <Route path="farmer/:id" element={<FarmerDetail />} />
            <Route path="farmer/:id/slip" element={<Placeholder titleKey="page.slip.title" />} />
          </Route>

          <Route path="/about" element={<Placeholder titleKey="page.about.title" />} />
          <Route path="*" element={<Placeholder titleKey="page.notFound" />} />
        </Routes>
      </HashRouter>
    </I18nProvider>
  )
}
