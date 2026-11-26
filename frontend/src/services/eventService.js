const API_URL = 'http://localhost:8080/api'

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
    },
    body: JSON.stringify(event),
  })

  if (!response.ok) {
    throw new Error(`Impossible de créer l'événement (code ${response.status})`)
  }

  return response.json()
}

export async function getUpcomingEvents() {
  let response

  try {
    response = await fetch(`${API_URL}/events/upcoming`)
  } catch {
    throw new Error('Impossible de contacter le serveur')
  }

  if (!response.ok) {
    throw new Error('Impossible de charger les événements à venir')
  }

  return response.json()
}