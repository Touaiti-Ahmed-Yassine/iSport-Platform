import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getEventById, updateEvent, getSports } from '../services/eventService'
import { getCurrentUser } from '../services/authService'
import './CreateEvent.css'

const DURATIONS = [
  { label: '1h', minutes: 60 },
  { label: '1h30', minutes: 90 },
  { label: '2h', minutes: 120 },
]

const SPORT_ICONS = [
  ['foot', '⚽'],
  ['basket', '🏀'],
  ['volley', '🏐'],
  ['frisbee', '🥏'],
  ['tennis', '🎾'],
]

function iconFor(name = '') {
  const lower = name.toLowerCase()
  const found = SPORT_ICONS.find(([key]) => lower.includes(key))
  return found ? found[1] : '🏅'
}

function openPicker(ref) {
  try {
    ref.current?.showPicker()
  } catch {
    // Navigateur sans showPicker
  }
}

function validate(form) {
  const errors = {}

  if (!form.titre.trim()) errors.titre = 'Le titre est obligatoire'
  if (!form.sportId) errors.sportId = 'Choisis un sport'
  if (!form.lieu.trim()) errors.lieu = 'Le lieu est obligatoire'
  if (!form.date) errors.date = 'La date est obligatoire'
  if (!form.heure) errors.heure = "L'heure est obligatoire"

  if (form.date && form.heure) {
    const start = new Date(`${form.date}T${form.heure}`)
    if (start <= new Date()) {
      errors.date = "La date et l'heure doivent être dans le futur"
    }
  }

  if (form.maxParticipants < 1) {
    errors.maxParticipants = 'Au moins 1 joueur'
  }

  return errors
}

function EditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [sports, setSports] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const dateRef = useRef(null)
  const timeRef = useRef(null)

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      setLoading(true)
      setLoadError('')

      try {
        const [eventData, sportsData, user] = await Promise.all([
          getEventById(id),
          getSports(),
          getCurrentUser().catch(() => null),
        ])

        if (!ignore) {
          // Contrôle autorisation UI
          if (
            eventData.creator &&
            user &&
            eventData.creator.email !== user.email &&
            eventData.creator.login !== user.login
          ) {
            setLoadError("Vous n'êtes pas autorisé à modifier cet événement.")
            return
          }

          setSports(sportsData)
          setForm({
            titre: eventData.titre || '',
            sportId: eventData.sport?.id ? String(eventData.sport.id) : '',
            date: eventData.date || '',
            heure: eventData.heure ? eventData.heure.slice(0, 5) : '',
            dureeMinutes: eventData.dureeMinutes || 90,
            lieu: eventData.lieu || '',
            maxParticipants: eventData.maxParticipants || 10,
            description: eventData.description || '',
          })
        }
      } catch (err) {
        if (!ignore) {
          setLoadError(err.message || "Impossible de charger l'événement à modifier.")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [id])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function selectSport(sportId) {
    setForm((current) => ({ ...current, sportId: String(sportId) }))
  }

  function selectDuration(minutes) {
    setForm((current) => ({ ...current, dureeMinutes: minutes }))
  }

  function changePlayers(delta) {
    setForm((current) => ({
      ...current,
      maxParticipants: Math.max(1, current.maxParticipants + delta),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const foundErrors = validate(form)
    setErrors(foundErrors)

    if (Object.keys(foundErrors).length > 0) return

    try {
      setSubmitting(true)
      await updateEvent(id, {
        titre: form.titre.trim(),
        sportId: Number(form.sportId),
        date: form.date,
        heure: form.heure,
        dureeMinutes: Number(form.dureeMinutes),
        lieu: form.lieu.trim(),
        maxParticipants: Number(form.maxParticipants),
        description: form.description ? form.description.trim() : null,
      })
      navigate(`/events/${id}`)
    } catch (err) {
      setSubmitError(err.message || 'Impossible de mettre à jour le match')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="create-match" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p>Chargement des données du match...</p>
      </div>
    )
  }

  if (loadError || !form) {
    return (
      <div className="create-match" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Accès refusé ou événement introuvable</h2>
        <p style={{ color: '#ef4444', margin: '14px 0 24px' }}>{loadError}</p>
        <Link to="/tableau-de-bord" className="cm-button-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Retour au tableau de bord
        </Link>
      </div>
    )
  }

  return (
    <section className="create-match">
      <header className="cm-header">
        <h2>Modifier le match</h2>
        <p>
          Mettez à jour les informations de votre match. Les modifications seront enregistrées et visibles par tous les sportifs.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        {/* Titre */}
        <div className="cm-section">
          <h3 className="cm-label">
            <span className="cm-step">1</span>TITRE DU MATCH
          </h3>
          <div className="cm-field">
            <input
              name="titre"
              type="text"
              placeholder="Ex : Pickup Game du samedi"
              value={form.titre}
              onChange={handleChange}
              className={errors.titre ? 'cm-input-error' : ''}
            />
            {errors.titre && <span className="cm-error">{errors.titre}</span>}
          </div>
        </div>

        {/* Sport */}
        <div className="cm-section">
          <h3 className="cm-label">
            <span className="cm-step">2</span>SPORT CONCERNÉ
          </h3>
          <div className="cm-sports-grid">
            {sports.map((sport) => {
              const selected = String(sport.id) === form.sportId
              return (
                <button
                  type="button"
                  key={sport.id}
                  className={`cm-sport-card ${selected ? 'cm-sport-selected' : ''}`}
                  onClick={() => selectSport(sport.id)}
                >
                  <span className="cm-sport-icon">{iconFor(sport.name)}</span>
                  <span className="cm-sport-name">{sport.name}</span>
                </button>
              )
            })}
          </div>
          {errors.sportId && <span className="cm-error">{errors.sportId}</span>}
        </div>

        {/* Lieu */}
        <div className="cm-section">
          <h3 className="cm-label">
            <span className="cm-step">3</span>LIEU DE RENCONTRE
          </h3>
          <div className="cm-field">
            <input
              name="lieu"
              type="text"
              placeholder="Ex : Gymnase municipal, Parc du Belvédère..."
              value={form.lieu}
              onChange={handleChange}
              className={errors.lieu ? 'cm-input-error' : ''}
            />
            {errors.lieu && <span className="cm-error">{errors.lieu}</span>}
          </div>
        </div>

        {/* Date, Heure & Durée */}
        <div className="cm-section">
          <h3 className="cm-label">
            <span className="cm-step">4</span>DATE, HEURE & DURÉE
          </h3>
          <div className="cm-row-3">
            <div className="cm-field">
              <label>Date</label>
              <input
                ref={dateRef}
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className={errors.date ? 'cm-input-error' : ''}
                onClick={() => openPicker(dateRef)}
              />
              {errors.date && <span className="cm-error">{errors.date}</span>}
            </div>

            <div className="cm-field">
              <label>Heure de début</label>
              <input
                ref={timeRef}
                name="heure"
                type="time"
                value={form.heure}
                onChange={handleChange}
                className={errors.heure ? 'cm-input-error' : ''}
                onClick={() => openPicker(timeRef)}
              />
              {errors.heure && <span className="cm-error">{errors.heure}</span>}
            </div>

            <div className="cm-field">
              <label>Durée</label>
              <div className="cm-durations">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.minutes}
                    type="button"
                    className={`cm-duration-pill ${form.dureeMinutes === dur.minutes ? 'cm-duration-selected' : ''}`}
                    onClick={() => selectDuration(dur.minutes)}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Joueurs Max */}
        <div className="cm-section">
          <h3 className="cm-label">
            <span className="cm-step">5</span>NOMBRE MAX DE JOUEURS
          </h3>
          <div className="cm-stepper">
            <button
              type="button"
              className="cm-step-btn"
              onClick={() => changePlayers(-1)}
              disabled={form.maxParticipants <= 1}
            >
              -
            </button>
            <span className="cm-step-value">{form.maxParticipants} joueurs</span>
            <button
              type="button"
              className="cm-step-btn"
              onClick={() => changePlayers(1)}
            >
              +
            </button>
          </div>
          {errors.maxParticipants && (
            <span className="cm-error">{errors.maxParticipants}</span>
          )}
        </div>

        {/* Description & Consignes */}
        <div className="cm-section">
          <h3 className="cm-label">
            <span className="cm-step">6</span>DESCRIPTION & CONSIGNES (OPTIONNEL)
          </h3>
          <div className="cm-field">
            <textarea
              name="description"
              rows={3}
              placeholder="Ex : Prévoir des chasubles, niveau intermédiaire bienvenu..."
              value={form.description}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #dce4ee',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {submitError && <div className="cm-submit-error">{submitError}</div>}

        <div className="cm-actions">
          <Link to={`/events/${id}`} className="cm-button-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Annuler
          </Link>
          <button
            type="submit"
            className="cm-button-primary"
            disabled={submitting}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default EditEvent
