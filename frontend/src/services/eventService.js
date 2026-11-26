import { getToken } from './authService'

const API_URL = 'http://localhost:8080/api'

function getAuthHeaders() {
  const token = getToken()

  return token
    ? { Authorization: `Bearer ${token}` }
    : {}
}

export async function getSports() {
  const response = await fetch(`${API_URL}/sports`)

  if (!response.ok) {
    throw new Error('Impossible de charger les sports')
  }

  return response.json()
}

export async function createEvent(event) {
  const response = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(event),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.message || `Impossible de créer l'événement (code ${response.status})`)
  }

  return response.json()
}

export async function getUpcomingEvents() {
  let response

  try {
    response = await fetch(`${API_URL}/events/upcoming`, {
      headers: getAuthHeaders(),
    })
  } catch {
    throw new Error('Impossible de contacter le serveur')
  }

  if (!response.ok) {
    throw new Error(`Impossible de charger les événements (code ${response.status})`)
  }

  return response.json()
}

/**
 * US-07: Détails d'un événement
 */
export async function getEventById(id) {
  let response

  try {
    response = await fetch(`${API_URL}/events/${id}`, {
      headers: getAuthHeaders(),
    })
  } catch {
    throw new Error('Impossible de contacter le serveur')
  }

  if (response.status === 404) {
    throw new Error('Événement introuvable')
  }

  if (!response.ok) {
    throw new Error(`Impossible de charger l'événement (code ${response.status})`)
  }

  return response.json()
}

/**
 * US-09: Modifier un événement
 */
export async function updateEvent(id, eventData) {
  const response = await fetch(`${API_URL}/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(eventData),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.message || `Impossible de modifier l'événement (code ${response.status})`)
  }

  return response.json()
}

/**
 * US-10: Annuler un événement
 */
export async function cancelEvent(id) {
  const response = await fetch(`${API_URL}/events/${id}/cancel`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.message || `Impossible d'annuler l'événement (code ${response.status})`)
  }

  return response.json()
}

/**
 * US-10: Supprimer un événement
 */
export async function deleteEvent(id) {
  const response = await fetch(`${API_URL}/events/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  })

  if (!response.ok && response.status !== 204) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.message || `Impossible de supprimer l'événement (code ${response.status})`)
  }

  return true
}
