
import { useEffect, useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import { logout, getCurrentUser } from './services/authService'

const API_URL = 'http://localhost:8080/api/sports'

function SportsScreen({ user, onLogout }) {
  const [sports, setSports] = useState([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchSports() {
    try {
      setError('')
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Unable to load sports')
      }

      const data = await response.json()
      setSports(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

useEffect(() => {
  let ignore = false

  async function loadSports() {
    try {
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Unable to load sports')
      }

      const data = await response.json()

      if (!ignore) {
        setSports(data)
        setError('')
      }
    } catch (err) {
      if (!ignore) {
        setError(err.message)
      }
    } finally {
      if (!ignore) {
        setLoading(false)
      }
    }
  }

  loadSports()

  return () => {
    ignore = true
  }
}, [])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) return

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (!response.ok) {
        throw new Error('Unable to save sport')
      }

      setName('')
      setEditingId(null)
      await fetchSports()
    } catch (err) {
      setError(err.message)
    }
  }

  function handleEdit(sport) {
    setName(sport.name)
    setEditingId(sport.id)
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Unable to delete sport')
      }

      await fetchSports()
    } catch (err) {
      setError(err.message)
    }
  }

  function handleCancel() {
    setName('')
    setEditingId(null)
  }

  return (
    <main className="container">
      <header className="header">
        <h1>iSport</h1>
        <p>Sports Management Platform</p>
        <p>
          Connecté : {user.login}{' '}
          <button type="button" onClick={onLogout}>Déconnexion</button>
        </p>
      </header>

      <section className="panel">
        <h2>{editingId ? 'Edit Sport' : 'Add a Sport'}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter sport name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <button type="submit">
            {editingId ? 'Update Sport' : 'Add Sport'}
          </button>

          {editingId && (
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="panel">
        <h2>Available Sports</h2>

        {loading && <p>Loading sports...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && sports.length === 0 && (
          <p>No sports available yet.</p>
        )}

        <div className="sports-list">
          {sports.map((sport) => (
            <article className="sport-item" key={sport.id}>
              <span>{sport.name}</span>

              <div className="actions">
                <button onClick={() => handleEdit(sport)}>
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() => handleDelete(sport.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}


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

  if (checkingSession) {
    return <p>Chargement de votre session...</p>
  }

  if (user) {
    return (
      <SportsScreen
        user={user}
        onLogout={() => {
          logout()
          setUser(null)
          setView('login')
        }}
      />
    )
  }

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


export default App
