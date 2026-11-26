import { useState } from 'react'
import { login } from '../services/authService'

function Login({ onSuccess, onSwitch, notice }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(form)
      onSuccess(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <header className="header">
        <h1>iSport</h1>
        <p>Sports Management Platform</p>
      </header>

      <section className="panel">
        <h2>Connexion</h2>

        <form onSubmit={handleSubmit}>
          {notice && <p>{notice}</p>}

          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} required />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? '...' : 'Se connecter'}
          </button>
          <button type="button" onClick={onSwitch}>
            Créer un compte
          </button>
        </form>
      </section>
    </main>
  )
}

export default Login
