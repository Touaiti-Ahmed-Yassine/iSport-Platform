
const API_URL = 'http://localhost:8080/api/auth'

async function post(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue.')
  }

  return data
}

export const register = (payload) => post('/register', payload)

export async function login(payload) {
  const data = await post('/login', payload)
  localStorage.setItem('token', data.token)
  return data
}

export function logout() {
  localStorage.removeItem('token')
}

export function getToken() {
  return localStorage.getItem('token')
}

export async function getCurrentUser() {
  const token = getToken()

  if (!token) return null

  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (response.status === 401) {
    logout()
    return null
  }

  if (!response.ok) {
    throw new Error('Impossible de récupérer la session.')
  }

  return response.json()
}
