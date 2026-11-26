import { useState } from 'react'
import { register } from '../services/authService'
import logo from '../assets/logo.png'
import Footer from '../components/Footer'
import './Login.css'

function Register({ onSuccess, onSwitch }) {
  const [form, setForm] = useState({
    login: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
      setError(err.message || "Une erreur est survenue lors de l'inscription.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Top Navigation Bar */}
      <header className="auth-navbar">
        <div className="auth-navbar-inner">
          <div className="auth-navbar-left">
            <div className="auth-navbar-logo">
              <img src={logo} alt="iSport - Connect. Play. Discover." />
            </div>

            <nav className="auth-navbar-links">
              <button type="button" className="auth-nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Accueil
              </button>
              <button type="button" className="auth-nav-link" onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}>
                Rechercher des matchs
              </button>
              <button type="button" className="auth-nav-link" onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}>
                Pourquoi iSport
              </button>
              <button type="button" className="auth-nav-search-btn" aria-label="Recherche">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </nav>
          </div>

          <div className="auth-navbar-right">
            <button type="button" className="auth-nav-login-btn" onClick={onSwitch}>
              Connexion
            </button>
            <button type="button" className="auth-nav-register-btn" onClick={() => {}}>
              <span>S'inscrire</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="auth-main">
        {/* Centered Hero Logo & Tagline */}
        <section className="auth-hero">
          <img src={logo} alt="iSport" className="auth-hero-logo" />
          <p className="auth-hero-text">
            Rejoignez des milliers de sportifs locaux pour du basketball, football, volleyball et ultimate frisbee.
          </p>
        </section>

        {/* Register Card */}
        <div className="auth-card">
          {/* Segmented Switch */}
          <div className="auth-tabs">
            <button type="button" className="auth-tab" onClick={onSwitch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Connexion</span>
            </button>
            <button type="button" className="auth-tab active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              <span>S'inscrire</span>
            </button>
          </div>

          {/* Eyebrow & Title */}
          <div className="auth-card-eyebrow">NOUVEAU COMPTE</div>
          <div className="auth-card-title-row">
            <h1 className="auth-card-title">Inscription</h1>
            <div className="auth-card-badge-btn" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
          </div>

          {error && <div className="auth-alert-error">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label" htmlFor="register-login">
                Nom d'utilisateur
              </label>
              <div className="auth-input-container">
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="register-login"
                  name="login"
                  type="text"
                  className="auth-input"
                  placeholder="ex: AlexDupont"
                  value={form.login}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="register-email">
                Adresse Email
              </label>
              <div className="auth-input-container">
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder="PrenomNom@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="register-password">
                Mot de passe
              </label>
              <div className="auth-input-container">
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input auth-input-with-toggle"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="register-confirm">
                Confirmer le mot de passe
              </label>
              <div className="auth-input-container">
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="register-confirm"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: '10px' }}>
              <span>{loading ? 'Création en cours...' : "S'inscrire"}</span>
              {!loading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </form>

          {/* Switch link */}
          <div className="auth-switch-row">
            <span>Déjà un compte ?</span>
            <button type="button" className="auth-switch-btn" onClick={onSwitch}>
              <span>Se connecter</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* Feature Cards below */}
        <section className="auth-features-section">
          <div className="auth-features-grid">
            <div className="auth-feature-card">
              <div className="auth-feature-icon cyan">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <div className="auth-feature-body">
                <h3 className="auth-feature-title">Terrains Ouverts</h3>
                <p className="auth-feature-desc">
                  Consultez instantanément les gymnases et parcs municipaux praticables.
                </p>
              </div>
            </div>

            <div className="auth-feature-card">
              <div className="auth-feature-icon lime">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="auth-feature-body">
                <h3 className="auth-feature-title">Remplissage en direct</h3>
                <p className="auth-feature-desc">
                  Indicateurs temps réel : sachez s'il manque 1 gardien ou 2 ailiers pour jouer.
                </p>
              </div>
            </div>

            <div className="auth-feature-card">
              <div className="auth-feature-icon blue">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="auth-feature-body">
                <h3 className="auth-feature-title">100% Gratuit</h3>
                <p className="auth-feature-desc">
                  Conçu par des passionnés pour dynamiser le sport amateur de proximité.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Register
