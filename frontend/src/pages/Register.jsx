import React, { useState } from 'react';
import { register } from '../services/authService';

export default function Register({ onSwitchToLogin, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: true,
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
    setErrorMsg('');
    setSuccessMsg('');

    // Validations côté client (US-04)
    if (formData.password.length < 8) {
      setErrorMsg('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Le mot de passe et la confirmation ne sont pas identiques.');
      return;
    }
    if (!formData.acceptTerms) {
      setErrorMsg('Veuillez accepter les conditions d’utilisation.');
      return;
    }

    setLoading(true);
    try {
      const response = await register({
        login: formData.login,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMsg('Compte créé avec succès ! Redirection vers la connexion...');
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess(response);
        } else {
          onSwitchToLogin();
        }
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-tabs">
        <button type="button" className="tab-btn" onClick={onSwitchToLogin}>
          <span className="tab-icon">➔</span> Connexion
        </button>
        <button type="button" className="tab-btn active">
          <span className="tab-icon">👤+</span> S'inscrire
        </button>
      </div>

      <div className="auth-card-body">
        <div className="auth-title-row">
          <div>
            <span className="auth-badge-subtitle">NOUVEAU JOUEUR</span>
            <h2 className="auth-heading">Inscription</h2>
          </div>
          <div className="auth-header-icon">👤+</div>
        </div>

        {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
        {successMsg && <div className="auth-alert success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group-custom">
            <label>Nom d'utilisateur (Login)</label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                type="text"
                name="login"
                placeholder="Ex: raslene_j"
                value={formData.login}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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
            <label>Mot de passe (≥ 8 caractères)</label>
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

          <div className="form-group-custom">
            <label>Confirmation du mot de passe</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <span>J'accepte les conditions d'utilisation d'iSport</span>
            </label>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Création en cours...' : 'Créer mon compte ➔'}
          </button>
        </form>

        <p className="auth-switch-text">
          Vous avez déjà un compte ?{' '}
          <button type="button" className="link-btn" onClick={onSwitchToLogin}>
            Se connecter ➔
          </button>
        </p>
      </div>
    </div>
  );
}
