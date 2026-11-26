import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import './theme.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import CreateEvent from './pages/CreateEvent'
import SearchMatches from './pages/SearchMatches'
import Sports from './pages/Sports'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/tableau-de-bord" replace />} />
            <Route path="/tableau-de-bord" element={<Dashboard />} />
            <Route path="/creer-match" element={<CreateEvent />} />
            <Route path="/rechercher" element={<SearchMatches />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="*" element={<Navigate to="/tableau-de-bord" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App