import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getEventById, cancelEvent, deleteEvent } from '../services/eventService'
import { getCurrentUser } from '../services/authService'
import EventMap from '../components/map/EventMap'
import EventActionModal from '../components/events/EventActionModal'
import './EventDetails.css'

const SPORT_ICONS = [
  ['foot', '⚽', 'lav'],
  ['basket', '🏀', 'cyan'],
  ['volley', '🏐', 'cyan'],
  ['frisbee', '🥏', 'lime'],
  ['tennis', '🎾', 'lime'],
]

function getSportLook(name = '') {
  const lower = name.toLowerCase()
  const found = SPORT_ICONS.find(([key]) => lower.includes(key))
  return found
    ? { icon: found[1], tone: found[2] }
    : { icon: '🏅', tone: 'cyan' }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDuration(minutes) {
  if (!minutes) return ''
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, '0')}`
}

function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  // Modal actions (US-10)
  const [modalMode, setModalMode] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [feedbackNotice, setFeedbackNotice] = useState('')

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      setError('')

      try {
        const [eventData, user] = await Promise.all([
          getEventById(id),
          getCurrentUser().catch(() => null),
        ])

        if (active) {
          setEvent(eventData)
          setCurrentUser(user)
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Impossible de charger les détails de cet événement.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [id])

  // Vérifier si l'utilisateur actuel est le créateur
  const isCreator =
    currentUser &&
    event &&
    (!event.creator ||
      event.creator.email === currentUser.email ||
      event.creator.login === currentUser.login)

  async function handleConfirmAction() {
    if (!modalMode) return
    setActionLoading(true)

    try {
      if (modalMode === 'cancel') {
        const updated = await cancelEvent(id)
        setEvent(updated)
        setFeedbackNotice('Le match a bien été annulé.')
      } else if (modalMode === 'delete') {
        await deleteEvent(id)
        navigate('/tableau-de-bord', {
          state: { notice: "L'événement a été supprimé avec succès." },
        })
        return
      }
      setModalMode(null)
    } catch (err) {
      alert(err.message || "Une erreur est survenue lors de l'opération.")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="details-container">
        <div className="details-card details-loading">
          <div className="details-spinner"></div>
          <p>Chargement des détails de l'événement...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="details-container">
        <div className="details-card details-error-card">
          <div className="details-error-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2>Événement introuvable</h2>
          <p>{error || "Cet événement n'existe pas ou a été supprimé."}</p>
          <Link to="/tableau-de-bord" className="details-back-link">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  const look = getSportLook(event.sport?.name)
  const isCancelled = event.status === 'ANNULE'

  return (
    <div className="details-container">
      {/* Bouton retour */}
      <div className="details-nav-bar">
        <Link to="/tableau-de-bord" className="details-back-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Retour aux matchs</span>
        </Link>

        {/* Actions Créateur (US-09 & US-10) */}
        {isCreator && (
          <div className="details-creator-actions">
            {!isCancelled && (
              <Link to={`/events/${event.id}/modifier`} className="details-action-btn edit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Modifier</span>
              </Link>
            )}

            {!isCancelled && (
              <button
                type="button"
                className="details-action-btn cancel"
                onClick={() => setModalMode('cancel')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>Annuler le match</span>
              </button>
            )}

            <button
              type="button"
              className="details-action-btn delete"
              onClick={() => setModalMode('delete')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>Supprimer</span>
            </button>
          </div>
        )}
      </div>

      {feedbackNotice && (
        <div className="details-banner-notice">
          {feedbackNotice}
        </div>
      )}

      {/* Main Details Card */}
      <div className="details-card">
        {/* Header section with sport badge and title */}
        <div className="details-header">
          <div className="details-title-group">
            <span className={`details-sport-avatar tone-${look.tone}`}>
              {look.icon}
            </span>
            <div>
              <div className="details-badges-row">
                <span className="details-sport-name">{event.sport?.name}</span>
                {isCancelled ? (
                  <span className="details-status-badge cancelled">Match Annulé</span>
                ) : (
                  <span className="details-status-badge open">Inscriptions Ouvertes</span>
                )}
              </div>
              <h1 className="details-title">{event.titre}</h1>
            </div>
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="details-grid">
          <div className="details-info-item">
            <div className="details-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
            </div>
            <div className="details-item-content">
              <span className="details-item-label">Date & Heure</span>
              <strong>{formatDate(event.date)}</strong>
              <small>À {event.heure?.slice(0, 5)} {event.dureeMinutes ? `(${formatDuration(event.dureeMinutes)})` : ''}</small>
            </div>
          </div>

          <div className="details-info-item">
            <div className="details-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>
            <div className="details-item-content">
              <span className="details-item-label">Lieu du match</span>
              <strong>{event.lieu}</strong>
              <small>Terrain et installations vérifiés</small>
            </div>
          </div>

          <div className="details-info-item">
            <div className="details-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="details-item-content">
              <span className="details-item-label">Participants</span>
              <strong>{event.maxParticipants} joueurs maximum</strong>
              <small>Place garantie par inscription</small>
            </div>
          </div>

          <div className="details-info-item">
            <div className="details-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div className="details-item-content">
              <span className="details-item-label">Organisateur</span>
              <strong>{event.creator ? (event.creator.login || event.creator.email) : 'Membre iSport'}</strong>
              <small>{event.creator?.email || 'Contact via la plateforme'}</small>
            </div>
          </div>
        </div>

        {/* Description section if present */}
        {event.description && (
          <div className="details-description-box">
            <h3 className="details-section-heading">Description & Consignes</h3>
            <p>{event.description}</p>
          </div>
        )}

        {/* US-08: Carte et localisation interactive */}
        <EventMap
          lieu={event.lieu}
          latitude={event.latitude}
          longitude={event.longitude}
          titre={event.titre}
        />
      </div>

      {/* Confirmation Modal (US-10) */}
      <EventActionModal
        isOpen={Boolean(modalMode)}
        mode={modalMode}
        eventTitle={event.titre}
        loading={actionLoading}
        onClose={() => setModalMode(null)}
        onConfirm={handleConfirmAction}
      />
    </div>
  )
}

export default EventDetails
