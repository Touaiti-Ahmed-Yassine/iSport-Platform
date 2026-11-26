import React, { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  return (
    <div className="isport-page">
      {/* Top Navbar */}
      <header className="isport-header">
        <div className="header-left">
          <div className="brand-logo">
            <span className="logo-runner">🏃‍♂️</span>
            <div className="logo-text-group">
              <span className="brand-name">iSport</span>
              <span className="brand-slogan">Connect. Play. Discover.</span>
            </div>
          </div>
          <nav className="header-nav">
            <a href="#accueil" className="nav-item active">Accueil</a>
            <a href="#recherche" className="nav-item">Rechercher des matchs</a>
            <a href="#pourquoi" className="nav-item">Pourquoi iSport</a>
          </nav>
        </div>

        <div className="header-right">
          <span className="search-icon-nav">🔍</span>
          {currentUser ? (
            <div className="user-profile-badge">
              <span className="user-avatar">👤</span>
              <span className="user-name">{currentUser.login}</span>
              <button type="button" className="btn-logout" onClick={handleLogout}>
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="header-auth-actions">
              <button
                type="button"
                className={`btn-nav-text ${currentView === 'login' ? 'active' : ''}`}
                onClick={() => setCurrentView('login')}
              >
                Connexion
              </button>
              <button
                type="button"
                className="btn-nav-primary"
                onClick={() => setCurrentView('register')}
              >
                S'inscrire ➔
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="isport-main">
        {/* Central Logo & Intro Headline */}
        <section className="intro-section">
          <div className="hero-logo-box">
            <span className="hero-logo-icon">🏃‍♂️</span>
            <span className="hero-logo-title">iSport</span>
          </div>
          <p className="intro-subtitle">
            Rejoignez des milliers de sportifs locaux pour du basketball, football, volleyball et ultimate frisbee.
          </p>
        </section>

        {/* Auth Box (Login or Register) */}
        <section className="auth-section">
          {currentUser ? (
            <div className="logged-in-card">
              <h2>🎉 Vous êtes connecté avec succès !</h2>
              <p>
                Bienvenue <strong>{currentUser.login}</strong> ({currentUser.email})
              </p>
              <div className="logged-actions">
                <button type="button" className="btn-auth-submit" onClick={handleLogout}>
                  Se déconnecter
                </button>
              </div>
            </div>
          ) : currentView === 'login' ? (
            <Login
              onSwitchToRegister={() => setCurrentView('register')}
              onLoginSuccess={handleLoginSuccess}
            />
          ) : (
            <Register
              onSwitchToLogin={() => setCurrentView('login')}
              onRegisterSuccess={(user) => {
                setCurrentUser(user);
              }}
            />
          )}
        </section>

        {/* Feature Highlights Grid */}
        <section className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-badge blue">📍</div>
            <div className="feature-content">
              <h4>Terrains Ouverts</h4>
              <p>Consultez instantanément les gymnases et parcs municipaux praticables.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-badge green">👥</div>
            <div className="feature-content">
              <h4>Remplissage en direct</h4>
              <p>Indicateurs temps réel : sachez s'il manque 1 gardien ou 2 ailiers pour jouer.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-badge indigo">🛡️</div>
            <div className="feature-content">
              <h4>100% Gratuit</h4>
              <p>Conçu par des passionnés pour dynamiser le sport amateur de proximité.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="isport-footer">
        <div className="footer-left">
          <span className="footer-logo">🏃‍♂️ iSport</span>
          <span>&copy; 2026 iSport Platform. Tous droits réservés.</span>
        </div>
        <div className="footer-links">
          <a href="#regles">Règles de jeu</a>
          <a href="#partenaires">Terrains partenaires</a>
          <a href="#support">Support</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
