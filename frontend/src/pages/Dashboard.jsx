import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getUpcomingEvents } from '../services/eventService'
import './Dashboard.css'

const SPORT_ICONS = [
  ['foot', '⚽', 'lav'],
  ['basket', '🏀', 'cyan'],
  ['volley', '🏐', 'cyan'],
  ['frisbee', '🥏', 'lime'],
  ['tennis', '🎾', 'lime'],
]

function sportLook(name) {
  const lower = name.toLowerCase()
  const found = SPORT_ICONS.find(([key]) => lower.includes(key))
  return found
    ? { icon: found[1], tone: found[2] }
    : { icon: '🏅', tone: 'cyan' }
}

function Icon({ name }) {
  const paths = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    plus: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
        <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.4c2.2.7 3.5 2.6 3.5 5.6" />
      </>
    ),
  }

  return (
    <svg
      className="db-svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function startOf(event) {
  return new Date(`${event.date}T${event.heure}`)
}

function localDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDay(event) {
  return startOf(event).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(minutes) {
  if (!minutes) return ''
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, '0')}`
}

function timeRange(event) {
  const start = startOf(event)
  if (!event.dureeMinutes) return formatTime(start)
  const end = new Date(start.getTime() + event.dureeMinutes * 60000)
  return `${formatTime(start)} - ${formatTime(end)}`
}

function timeUntil(event, now) {
  const minutes = Math.round((startOf(event) - now) / 60000)
  if (minutes <= 0) return 'Maintenant'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `Dans ${rest} min`
  return `Dans ${hours}h ${String(rest).padStart(2, '0')}`
}

function whenBadge(event, now, weekLimit) {
  const today = localDateString(now)
  const tomorrow = localDateString(new Date(now.getTime() + 24 * 60 * 60 * 1000))

  if (event.date === today) return { label: "AUJOURD'HUI", tone: 'lime' }
  if (event.date === tomorrow) return { label: 'DEMAIN', tone: 'cyan' }
  if (startOf(event) <= weekLimit) return { label: 'CETTE SEMAINE', tone: 'lav' }
  return null
}

function Dashboard() {
  const location = useLocation()
  const justCreated = location.state?.created === true

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [filter, setFilter] = useState('all')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let ignore = false

    async function loadEvents() {
      try {
        const data = await getUpcomingEvents()
        if (!ignore) {
          setEvents(data)
          setNow(new Date())
        }
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadEvents()

    return () => {
      ignore = true
    }
  }, [reloadKey])

  function handleReload() {
    setLoading(true)
    setError('')
    setReloadKey((current) => current + 1)
  }

  const todayString = localDateString(now)
  const weekLimit = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const todayEvents = events.filter((event) => event.date === todayString)
  const matchOfDay = todayEvents[0]
  const otherEvents = events.filter((event) => event !== matchOfDay)
  const weekEvents = otherEvents.filter((event) => startOf(event) <= weekLimit)
  const shownEvents = filter === 'week' ? weekEvents : otherEvents
  const weekCount = events.filter((event) => startOf(event) <= weekLimit).length

  const sportCounts = events.reduce((counts, event) => {
    const name = event.sport.name
    counts[name] = (counts[name] || 0) + 1
    return counts
  }, {})

  const todayLabel = now.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  })

  const matchLook = matchOfDay ? sportLook(matchOfDay.sport.name) : null

  return (
    <section className="dashboard">
      <div className="db-top">
        <div>
          <p className="db-date">
            <Icon name="calendar" />
            Aujourd'hui, {todayLabel}
            {!loading && !error && (
              <span className="db-today">
                <span className="db-live" />
                {todayEvents.length === 0
                  ? "aucun match prévu aujourd'hui"
                  : `${todayEvents.length} match${todayEvents.length > 1 ? 's' : ''} prévu${todayEvents.length > 1 ? 's' : ''} aujourd'hui`}
              </span>
            )}
          </p>
          <h1 className="db-title">Bienvenue !</h1>
          <p className="db-subtitle">
            Prêt à fouler le parquet ? Voici le point complet sur vos rendez-vous
            sportifs.
          </p>
        </div>

        <Link to="/creer-match" className="db-primary">
          <Icon name="plus" />
          Organiser un match
        </Link>
      </div>

      {justCreated && <p className="db-success">Match publié avec succès</p>}

      {loading && <p className="db-state">Chargement des événements...</p>}

      {!loading && error && (
        <div className="db-state db-box">
          <p className="db-error">{error}</p>
          <button type="button" className="db-button" onClick={handleReload}>
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="db-state db-box">
          <p>Aucun événement à venir pour le moment.</p>
          <Link to="/creer-match" className="db-primary">
            <Icon name="plus" />
            Créer un match
          </Link>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="db-grid">
          <div className="db-main">
            <h2 className="db-section-title">
              <span className="db-dot" />
              Match du jour
              {matchOfDay && (
                <span className="db-chip">
                  COUP D'ENVOI À {formatTime(startOf(matchOfDay))}
                </span>
              )}
            </h2>

            {matchOfDay ? (
              <article className="db-box db-today-card">
                <span className={`db-icon db-icon-big db-tone-${matchLook.tone}`}>
                  {matchLook.icon}
                </span>

                <div className="db-info">
                  <div className="db-tags">
                    <span className="db-badge db-badge-cyan">
                      {matchOfDay.sport.name}
                    </span>
                    <span className="db-badge db-badge-lime">
                      {matchOfDay.maxParticipants} joueurs max
                    </span>
                  </div>
                  <h3 className="db-card-title">
                    <Link to={`/events/${matchOfDay.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {matchOfDay.titre}
                    </Link>
                  </h3>
                  <span className="db-meta">
                    <Icon name="pin" />
                    {matchOfDay.lieu}
                  </span>
                </div>

                <div className="db-hours">
                  <span className="db-hours-label">HORAIRES</span>
                  <strong>{timeRange(matchOfDay)}</strong>
                  <span className="db-hours-left">{timeUntil(matchOfDay, now)}</span>
                </div>
              </article>
            ) : (
              <div className="db-box db-empty-day">
                Aucun match prévu aujourd'hui.
              </div>
            )}

            <div className="db-list-head">
              <div>
                <h2 className="db-list-title">Événements à venir</h2>
                <p className="db-muted">
                  Vos {otherEvents.length} prochaines sessions sportives
                  planifiées.
                </p>
              </div>

              <div className="db-tabs">
                <button
                  type="button"
                  className={filter === 'all' ? 'db-tab db-tab-active' : 'db-tab'}
                  onClick={() => setFilter('all')}
                >
                  Tous ({otherEvents.length})
                </button>
                <button
                  type="button"
                  className={filter === 'week' ? 'db-tab db-tab-active' : 'db-tab'}
                  onClick={() => setFilter('week')}
                >
                  Cette semaine ({weekEvents.length})
                </button>
              </div>
            </div>

            {shownEvents.length === 0 ? (
              <div className="db-box db-empty-day">
                Aucun autre événement à venir.
              </div>
            ) : (
              <ul className="db-list">
                {shownEvents.map((event) => {
                  const look = sportLook(event.sport.name)
                  const badge = whenBadge(event, now, weekLimit)

                  return (
                    <li className="db-box db-item" key={event.id}>
                      <span className={`db-icon db-tone-${look.tone}`}>
                        {look.icon}
                      </span>

                      <div className="db-info">
                        <div className="db-item-title">
                          <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <strong>{event.titre}</strong>
                          </Link>
                          {badge && (
                            <span className={`db-status db-status-${badge.tone}`}>
                              {badge.label}
                            </span>
                          )}
                        </div>
                        <div className="db-metas">
                          <span className="db-meta">
                            <Icon name="pin" />
                            {event.lieu}
                          </span>
                          <span className="db-meta">
                            <Icon name="calendar" />
                            {formatDay(event)} à {formatTime(startOf(event))}
                          </span>
                        </div>
                      </div>

                      <div className="db-side">
                        <strong>{event.maxParticipants} joueurs max</strong>
                        <span className="db-muted">
                          {event.sport.name}
                          {event.dureeMinutes
                            ? ` · ${formatDuration(event.dureeMinutes)}`
                            : ''}
                        </span>
                        <Link to={`/events/${event.id}`} style={{ fontSize: '13px', color: '#006680', fontWeight: 600, textDecoration: 'none', marginTop: '4px' }}>
                          Voir détails →
                        </Link>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <aside className="db-aside">
            <div className="db-box">
              <h3 className="db-aside-title">Récapitulatif</h3>
              <div className="db-stats">
                <div className="db-stat">
                  <strong>{events.length}</strong>
                  <span>À venir</span>
                </div>
                <div className="db-stat">
                  <strong>{todayEvents.length}</strong>
                  <span>Aujourd'hui</span>
                </div>
                <div className="db-stat db-stat-green">
                  <strong>{weekCount}</strong>
                  <span>7 jours</span>
                </div>
              </div>
            </div>

            <div className="db-box">
              <div className="db-aside-head">
                <h3 className="db-aside-title">Sports à venir</h3>
                <Link to="/sports" className="db-link">
                  Gérer
                </Link>
              </div>
              <div className="db-sports">
                {Object.entries(sportCounts).map(([name, count]) => (
                  <div className="db-sport" key={name}>
                    <span className="db-sport-icon">{sportLook(name).icon}</span>
                    <div>
                      <strong>{name}</strong>
                      <span className="db-muted">
                        {count} événement{count > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="db-invite">
              <h3>
                <Icon name="users" />
                Un joueur manquant ?
              </h3>
              <p>
                Organisez votre prochain match et invitez les joueurs de votre
                quartier.
              </p>
              <Link to="/creer-match" className="db-invite-button">
                Créer un match
              </Link>
            </div>
          </aside>
        </div>
      )}
    </section>
  )
}

export default Dashboard