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

          {/* Operator mode */}
          <Route path="/o/login" element={<Placeholder titleKey="page.operatorLogin.title" />} />
          <Route path="/o" element={<Placeholder titleKey="page.dashboard.title" />} />
          <Route path="/o/new" element={<Placeholder titleKey="page.register.title" />} />
          <Route path="/o/farmer/:id" element={<Placeholder titleKey="page.farmerDetail.title" />} />
          <Route path="/o/farmer/:id/slip" element={<Placeholder titleKey="page.slip.title" />} />

          <Route path="/about" element={<Placeholder titleKey="page.about.title" />} />
          <Route path="*" element={<Placeholder titleKey="page.notFound" />} />
        </Routes>
      </HashRouter>
    </I18nProvider>
  )
}
