import { useState } from 'react'
import { register } from '../services/authService'

function Register({ onSuccess, onSwitch }) {
  const [form, setForm] = useState({
    login: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      await register(form)
      onSuccess()
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
        <p>Créer un compte</p>
      </header>

      <section className="panel">
        <h2>Inscription</h2>

        <form onSubmit={handleSubmit}>
          <input name="login" placeholder="Login" value={form.login} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} required />
          <input name="confirmPassword" type="password" placeholder="Confirmer le mot de passe" value={form.confirmPassword} onChange={handleChange} required />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? '...' : "S'inscrire"}
          </button>
          <button type="button" onClick={onSwitch}>
            Déjà un compte ? Se connecter
          </button>
        </form>
      </section>
    </main>
  )
}

export default Register
