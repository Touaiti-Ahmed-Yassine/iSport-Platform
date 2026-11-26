import './EventMap.css'

function EventMap({ lieu, latitude, longitude, titre }) {
  // Coordonnées par défaut (ex: Tunis / stade central) si non renseignées
  const lat = latitude || 36.8065
  const lon = longitude || 10.1815

  // Bounding box pour OpenStreetMap embed
  const delta = 0.008
  const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`
  const externalOsmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lieu || `${lat},${lon}`)}`

  return (
    <div className="event-map-container">
      <div className="event-map-header">
        <div className="event-map-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <span>Localisation du terrain : <strong>{lieu || 'Terrain de sport'}</strong></span>
        </div>
        <div className="event-map-actions">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="event-map-link-btn"
          >
            <span>Itinéraire</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
          <a
            href={externalOsmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="event-map-link-btn secondary"
          >
            <span>Plein écran (OSM)</span>
          </a>
        </div>
      </div>

      <div className="event-map-frame-wrapper">
        <iframe
          title={`Carte pour ${titre || lieu}`}
          className="event-map-iframe"
          src={mapSrc}
          loading="lazy"
        />
      </div>

      <div className="event-map-footer">
        <span className="event-map-badge">
          <span className="event-map-dot"></span>
          Terrain praticable référencé
        </span>
        <small className="event-map-osm-credit">
          Données cartographiques © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
        </small>
      </div>
    </div>
  )
}

export default EventMap
