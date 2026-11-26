
import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import './App.css'
import './theme.css'

import Login from './pages/Login'
import Register from './pages/Register'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Dashboard from './pages/Dashboard'
import CreateEvent from './pages/CreateEvent'
import EventDetails from './pages/EventDetails'
import EditEvent from './pages/EditEvent'
import SearchMatches from './pages/SearchMatches'
import Sports from './pages/Sports'

import { logout, getCurrentUser } from './services/authService'

function App() {
  const [view, setView] = useState('login')
  const [user, setUser] = useState(null)
  const [notice, setNotice] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let active = true

    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser()

        if (active) {
          setUser(currentUser)
        }
      } catch (error) {
        if (active) {
          setNotice('Impossible de vérifier la session. Vérifiez le serveur.')
        }
      } finally {
        if (active) {
          setCheckingSession(false)
        }
      }
    }

    restoreSession()

    return () => {
      active = false
    }
  }, [])

  function handleLogout() {
    logout()
    setUser(null)
    setView('login')
  }

  if (checkingSession) {
    return <p>Chargement de votre session...</p>
  }

  if (!user) {
    if (view === 'register') {
      return (
        <Register
          onSuccess={() => {
            setNotice('Compte créé. Vous pouvez vous connecter.')
            setView('login')
          }}
          onSwitch={() => setView('login')}
        />
      )
    }

    return (
      <Login
        notice={notice}
        onSuccess={(loggedUser) => {
          setNotice('')
          setUser(loggedUser)
        }}
        onSwitch={() => setView('register')}
      />
    )
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />

        <div className="app-user-bar">
          <span>Connecté : {user.login}</span>
          <button type="button" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>

        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/tableau-de-bord" replace />}
            />
            <Route
              path="/tableau-de-bord"
              element={<Dashboard />}
            />
            <Route
              path="/creer-match"
              element={<CreateEvent />}
            />
            <Route
              path="/events/:id"
              element={<EventDetails />}
            />
            <Route
              path="/events/:id/modifier"
              element={<EditEvent />}
            />
            <Route
              path="/rechercher"
              element={<SearchMatches />}
            />
            <Route
              path="/sports"
              element={<Sports />}
            />
            <Route
              path="*"
              element={<Navigate to="/tableau-de-bord" replace />}
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
