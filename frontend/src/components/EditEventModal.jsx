import React, { useState } from 'react';
import { updateEvent, cancelEvent, deleteEvent } from '../services/eventService';

export default function EditEventModal({
  event,
  sports = [],
  currentUserId = 1,
  onClose,
  onRefresh,
  onLocalUpdate,
  onLocalCancel,
  onLocalDelete,
}) {
  const [formData, setFormData] = useState({
    title: event.title || '',
    sportId: event.sportId || (sports[0]?.id || 1),
    date: event.date || '',
    time: event.time ? event.time.substring(0, 5) : '18:00',
    location: event.location || '',
    maxParticipants: event.maxParticipants || 10,
    description: event.description || '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxParticipants' || name === 'sportId' ? Number(value) : value,
    }));
  };

  // US-09 : Modifier l'événement
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await updateEvent(event.id, formData, currentUserId);
      setSuccessMsg('Événement modifié avec succès !');
      setTimeout(() => {
        onRefresh();
        onClose();
      }, 600);
    } catch {
      // Mode démo : si le backend Spring Boot n'est pas encore allumé
      if (onLocalUpdate) {
        onLocalUpdate(event.id, formData);
      }
      setSuccessMsg('Événement modifié avec succès !');
      setTimeout(() => {
        onClose();
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  // US-10 : Annuler l'événement
  const handleCancelEvent = async () => {
    const confirmCancel = window.confirm(
      'Voulez-vous vraiment annuler cet événement ? Les participants seront avertis.'
    );
    if (!confirmCancel) return;

    setLoading(true);
    setErrorMsg('');
    try {
      await cancelEvent(event.id, currentUserId);
      onRefresh();
      onClose();
    } catch {
      if (onLocalCancel) {
        onLocalCancel(event.id);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // US-10 : Supprimer l'événement
  const handleDeleteEvent = async () => {
    const confirmDelete = window.confirm(
      '⚠️ Attention : La suppression est définitive ! Voulez-vous continuer ?'
    );
    if (!confirmDelete) return;

    setLoading(true);
    setErrorMsg('');
    try {
      await deleteEvent(event.id, currentUserId);
      onRefresh();
      onClose();
    } catch {
      if (onLocalDelete) {
        onLocalDelete(event.id);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>✏️ Modifier l'événement #{event.id}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {errorMsg && <div className="alert-box error">{errorMsg}</div>}
        {successMsg && <div className="alert-box success">{successMsg}</div>}

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Titre de l'événement</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sport</label>
              <select name="sportId" value={formData.sportId} onChange={handleChange} required>
                {sports.length > 0 ? (
                  sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))
                ) : (
                  <option value={formData.sportId}>{event.sportName || 'Football'}</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Max participants</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min={event.currentParticipants || 2}
                required
              />
              <span className="help-text">Inscrits actuels : {event.currentParticipants || 0}</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Heure</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Lieu / Terrain</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description (optionnel)</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="modal-footer">
            <div className="danger-actions">
              {event.status !== 'ANNULE' && (
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleCancelEvent}
                  disabled={loading}
                >
                  Annuler l'événement
                </button>
              )}
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteEvent}
                disabled={loading}
              >
                Supprimer
              </button>
            </div>

            <div className="primary-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Fermer
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || event.status === 'ANNULE'}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
