import React, { useState, useEffect } from 'react';
import './App.css';
import EventManagement from './components/events/EventManagement';

const SPORTS_API_URL = 'http://localhost:8080/api/sports';

function App() {
  const [activeTab, setActiveTab] = useState('events');

  // Sports state (T-03)
  const [sports, setSports] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchSports() {
    try {
      setError('');
      setLoading(true);
      const response = await fetch(SPORTS_API_URL);
      if (!response.ok) throw new Error('Impossible de charger les sports');
      const data = await response.json();
      setSports(data);
    } catch (err) {
      setError(err.message);
      // Fallback local list
      if (sports.length === 0) {
        setSports([
          { id: 1, name: 'Football' },
          { id: 2, name: 'Basketball' },
          { id: 3, name: 'Tennis' },
          { id: 4, name: 'Padel' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSports();
  }, []);

  async function handleSportSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      const url = editingId ? `${SPORTS_API_URL}/${editingId}` : SPORTS_API_URL;
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) throw new Error('Erreur de sauvegarde');
      setName('');
      setEditingId(null);
      await fetchSports();
    } catch {
      // Fallback local
      if (editingId) {
        setSports(sports.map((s) => (s.id === editingId ? { ...s, name: name.trim() } : s)));
      } else {
        setSports([...sports, { id: Date.now(), name: name.trim() }]);
      }
      setName('');
      setEditingId(null);
    }
  }

  function handleEditSport(sport) {
    setName(sport.name);
    setEditingId(sport.id);
  }

  async function handleDeleteSport(id) {
    try {
      await fetch(`${SPORTS_API_URL}/${id}`, { method: 'DELETE' });
      await fetchSports();
    } catch {
      setSports(sports.filter((s) => s.id !== id));
    }
  }

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="logo-brand">
          <span className="logo-icon">⚽</span>
          <span className="logo-title">iSport</span>
          <span className="logo-badge">Équipe 8</span>
        </div>
        <nav className="nav-links">
          <button
            type="button"
            className={`nav-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Mes Événements
          </button>
          <button
            type="button"
            className={`nav-btn ${activeTab === 'sports' ? 'active' : ''}`}
            onClick={() => setActiveTab('sports')}
          >
            Sports
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'events' ? (
          <EventManagement />
        ) : (
          <div className="sports-section">
            <div className="mgmt-header">
              <div>
                <h2>Gestion des Sports</h2>
                <p className="subtitle">Liste de référence des sports en base de données (T-03)</p>
              </div>
            </div>

            <section className="sports-form-card">
              <h3>{editingId ? 'Modifier le Sport' : 'Ajouter un Sport'}</h3>
              <form onSubmit={handleSportSubmit} className="sports-inline-form">
                <input
                  type="text"
                  placeholder="Nom du sport (ex: Football, Padel...)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Mettre à jour' : 'Ajouter'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setName('');
                      setEditingId(null);
                    }}
                  >
                    Annuler
                  </button>
                )}
              </form>
            </section>

            <section className="sports-list-card">
              <h3>Sports Disponibles</h3>
              {loading && <p>Chargement des sports...</p>}
              {error && <p className="alert-box error">{error}</p>}
              <div className="sports-grid-items">
                {sports.map((sport) => (
                  <div key={sport.id} className="sport-chip">
                    <span className="sport-chip-name">{sport.name}</span>
                    <div className="sport-chip-actions">
                      <button
                        type="button"
                        className="btn-action edit"
                        onClick={() => handleEditSport(sport)}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="btn-action delete"
                        onClick={() => handleDeleteSport(sport.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>iSport &copy; 2026 - Plateforme d'organisation d'événements sportifs amateurs (ISG Bizerte)</p>
      </footer>
    </div>
  );
}

export default App;
