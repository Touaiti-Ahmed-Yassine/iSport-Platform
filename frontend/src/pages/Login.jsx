import React, { useState } from 'react';
import { login } from '../services/authService';

export default function Login({ onSwitchToRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLoggedIn: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });
      setSuccessMsg(`Bienvenue ${response.login} ! Connexion réussie.`);
      if (onLoginSuccess) {
        onLoginSuccess(response);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-tabs">
        <button type="button" className="tab-btn active">
          <span className="tab-icon">➔</span> Connexion
        </button>
        <button type="button" className="tab-btn" onClick={onSwitchToRegister}>
          <span className="tab-icon">👤+</span> S'inscrire
        </button>
      </div>

      <div className="auth-card-body">
        <div className="auth-title-row">
          <div>
            <span className="auth-badge-subtitle">BON RETOUR</span>
            <h2 className="auth-heading">Connexion</h2>
          </div>
          <div className="auth-header-icon">➔]</div>
        </div>

        {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
        {successMsg && <div className="auth-alert success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group-custom">
            <label>Adresse Email</label>
            <div className="input-with-icon">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                name="email"
                placeholder="PrenomNom@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group-custom">
            <div className="label-with-link">
              <label>Mot de passe</label>
              <a href="#forgot" className="forgot-link" onClick={(e) => e.preventDefault()}>
                Mot de passe oublié ?
              </a>
            </div>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title="Afficher/Masquer le mot de passe"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="keepLoggedIn"
                checked={formData.keepLoggedIn}
                onChange={handleChange}
              />
              <span>Garder ma session active</span>
            </label>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter ➔'}
          </button>
        </form>

        <p className="auth-switch-text">
          Pas encore de compte ?{' '}
          <button type="button" className="link-btn" onClick={onSwitchToRegister}>
            Créer un compte ➔
          </button>
        </p>

        <div className="live-match-banner">
          <span className="live-icon">⚽</span>
          <div className="live-text">
            <strong>Matchs en direct aujourd'hui</strong>
            <span>42 sessions disponibles</span>
          </div>
        </div>
      </div>
    </div>
  );
}
