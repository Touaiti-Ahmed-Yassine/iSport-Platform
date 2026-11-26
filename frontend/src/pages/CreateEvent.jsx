import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEvent, getSports } from '../services/eventService'
import './CreateEvent.css'

const EMPTY_FORM = {
  titre: '',
  sportId: '',
  date: '',
  heure: '',
  dureeMinutes: 90,
  lieu: '',
  maxParticipants: 10,
}

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

function iconFor(name) {
  const lower = name.toLowerCase()
  const found = SPORT_ICONS.find(([key]) => lower.includes(key))
  return found ? found[1] : '🏅'
}

function todayLocal() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function openPicker(ref) {
  try {
    ref.current?.showPicker()
  } catch {
    // certains navigateurs n'ont pas showPicker : le champ reste utilisable
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

function CreateEvent() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [sports, setSports] = useState([])
  const [loadingSports, setLoadingSports] = useState(true)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const dateRef = useRef(null)
  const timeRef = useRef(null)

  useEffect(() => {
    let ignore = false

    async function loadSports() {
      try {
        const data = await getSports()
        if (!ignore) setSports(data)
      } catch (err) {
        if (!ignore) setSubmitError(err.message)
      } finally {
        if (!ignore) setLoadingSports(false)
      }
    }

    loadSports()

    return () => {
      ignore = true
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function selectSport(id) {
    setForm((current) => ({ ...current, sportId: String(id) }))
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

  function handleCancel() {
    setForm(EMPTY_FORM)
    setErrors({})
    setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const foundErrors = validate(form)
    setErrors(foundErrors)

    if (Object.keys(foundErrors).length > 0) return

    try {
      setSubmitting(true)
      await createEvent({
        titre: form.titre.trim(),
        sport: { id: Number(form.sportId) },
        date: form.date,
        heure: form.heure,
        dureeMinutes: Number(form.dureeMinutes),
        lieu: form.lieu.trim(),
        maxParticipants: Number(form.maxParticipants),
      })
      navigate('/tableau-de-bord', { state: { created: true } })
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="create-match">
      <header className="cm-header">
        <h2>Créer un match</h2>
        <p>
          Remplissez les détails pour trouver des partenaires de jeu dans votre
          ville et planifier une session sans friction.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
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
            />
          </div>
          {errors.titre && <p className="cm-error">{errors.titre}</p>}
        </div>

        <div className="cm-section">
          <h3 className="cm-label">
            <span className="cm-step">2</span>CHOISIR LE SPORT
            <span className="cm-hint">Sélection unique</span>
          </h3>

          {loadingSports && <p className="cm-muted">Chargement des sports...</p>}

          <div className="cm-sports">
            {sports.map((sport) => (
              <button
                type="button"
                key={sport.id}
                className={
                  String(sport.id) === form.sportId
                    ? 'cm-sport cm-sport-active'
                    : 'cm-sport'
                }
                onClick={() => selectSport(sport.id)}
              >
                <span className="cm-sport-icon">{iconFor(sport.name)}</span>
                <span className="cm-sport-name">{sport.name}</span>
              </button>
            ))}
          </div>
          {errors.sportId && <p className="cm-error">{errors.sportId}</p>}
        </div>

        <div className="cm-section">
          <h3 className="cm-label">
            <span className="cm-step">3</span>LIEU &amp; TERRAIN
          </h3>
          <div className="cm-field">
            <span className="cm-field-pin">📍</span>
            <input
              name="lieu"
              type="text"
              placeholder="Ex : Wilcox Park - Court #2"
              value={form.lieu}
              onChange={handleChange}
            />
          </div>
          {errors.lieu && <p className="cm-error">{errors.lieu}</p>}
        </div>

        <div className="cm-section">
          <h3 className="cm-label">
            <span className="cm-step">4</span>DATE &amp; HORAIRES
          </h3>
          <div className="cm-row">
            <div>
              <label className="cm-sublabel" htmlFor="date">
                Date de la rencontre
              </label>
              <div
                className="cm-field cm-field-click"
                onClick={() => openPicker(dateRef)}
              >
                <span className="cm-field-pin">📅</span>
                <input
                  id="date"
                  ref={dateRef}
                  name="date"
                  type="date"
                  min={todayLocal()}
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
              {errors.date && <p className="cm-error">{errors.date}</p>}
            </div>

            <div>
              <label className="cm-sublabel" htmlFor="heure">
                Coup d'envoi
              </label>
              <div
                className="cm-field cm-field-click"
                onClick={() => openPicker(timeRef)}
              >
                <span className="cm-field-pin">🕒</span>
                <input
                  id="heure"
                  ref={timeRef}
                  name="heure"
                  type="time"
                  value={form.heure}
                  onChange={handleChange}
                />
              </div>
              {errors.heure && <p className="cm-error">{errors.heure}</p>}
            </div>

            <div>
              <span className="cm-sublabel">Durée estimée</span>
              <div className="cm-durations">
                {DURATIONS.map((duration) => (
                  <button
                    type="button"
                    key={duration.minutes}
                    className={
                      form.dureeMinutes === duration.minutes
                        ? 'cm-duration cm-duration-active'
                        : 'cm-duration'
                    }
                    onClick={() => selectDuration(duration.minutes)}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="cm-section">
          <h3 className="cm-label">
            <span className="cm-step">5</span>JOUEURS
          </h3>
          <div className="cm-players">
            <div>
              <strong>Jauge totale de joueurs</strong>
              <p className="cm-muted">Nombre maximum de participants</p>
            </div>
            <div className="cm-counter">
              <button type="button" onClick={() => changePlayers(-1)}>
                −
              </button>
              <span>{form.maxParticipants}</span>
              <button type="button" onClick={() => changePlayers(1)}>
                +
              </button>
            </div>
          </div>
          {errors.maxParticipants && (
            <p className="cm-error">{errors.maxParticipants}</p>
          )}
        </div>

        {submitError && <p className="cm-error">{submitError}</p>}

        <div className="cm-footer">
          <button type="button" className="cm-cancel" onClick={handleCancel}>
            Annuler
          </button>
          <button type="submit" className="cm-submit" disabled={submitting}>
            {submitting ? 'Publication...' : 'Publier le match'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default CreateEvent