import './EventActionModal.css'

function EventActionModal({ isOpen, mode, eventTitle, onClose, onConfirm, loading }) {
  if (!isOpen) return null

  const isCancel = mode === 'cancel'

  return (
    <div className="action-modal-overlay" onClick={onClose}>
      <div className="action-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className={`action-modal-icon-badge ${isCancel ? 'warning' : 'danger'}`}>
          {isCancel ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          )}
        </div>

        <h3 className="action-modal-title">
          {isCancel ? "Annuler l'événement ?" : "Supprimer l'événement ?"}
        </h3>

        <p className="action-modal-desc">
          {isCancel ? (
            <>
              Êtes-vous sûr de vouloir <strong>annuler</strong> le match « {eventTitle} » ?
              Les participants seront prévenus que le match n'aura plus lieu.
            </>
          ) : (
            <>
              Êtes-vous certain de vouloir <strong>supprimer définitivement</strong> l'événement « {eventTitle} » ?
              Cette action est irréversible et supprimera toutes les informations associées.
            </>
          )}
        </p>

        <div className="action-modal-actions">
          <button
            type="button"
            className="action-modal-btn cancel"
            onClick={onClose}
            disabled={loading}
          >
            Retour
          </button>
          <button
            type="button"
            className={`action-modal-btn confirm ${isCancel ? 'warning' : 'danger'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Traitement en cours...' : (isCancel ? "Confirmer l'annulation" : 'Confirmer la suppression')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventActionModal
