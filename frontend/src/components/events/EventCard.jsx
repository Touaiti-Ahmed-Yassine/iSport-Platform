import React from 'react';

export default function EventCard({ event, onEdit, onCancel, onDelete, isCreator = true }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'OUVERT':
        return <span className="badge badge-open">Ouvert</span>;
      case 'COMPLET':
        return <span className="badge badge-full">Complet</span>;
      case 'ANNULE':
        return <span className="badge badge-cancelled">Annulé</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className={`event-card ${event.status === 'ANNULE' ? 'is-cancelled' : ''}`}>
      <div className="card-top">
        <span className="sport-tag">{event.sportName || 'Sport'}</span>
        {getStatusBadge(event.status)}
      </div>

      <h3 className="card-title">{event.title}</h3>
      <p className="card-desc">{event.description || 'Aucune description fournie.'}</p>

      <div className="card-details">
        <div className="detail-item">
          <span>📅 Date :</span>
          <strong>{event.date} à {event.time}</strong>
        </div>
        <div className="detail-item">
          <span>📍 Lieu :</span>
          <strong>{event.location}</strong>
        </div>
        <div className="detail-item">
          <span>👥 Places :</span>
          <strong>{event.currentParticipants} / {event.maxParticipants}</strong>
        </div>
      </div>

      {isCreator && (
        <div className="card-actions">
          {event.status !== 'ANNULE' && (
            <>
              <button className="btn-action edit" onClick={() => onEdit(event)}>
                ✏️ Modifier
              </button>
              <button className="btn-action cancel" onClick={() => onCancel(event.id)}>
                🚫 Annuler
              </button>
            </>
          )}
          <button className="btn-action delete" onClick={() => onDelete(event.id)}>
            🗑️ Supprimer
          </button>
        </div>
      )}
    </div>
  );
}
