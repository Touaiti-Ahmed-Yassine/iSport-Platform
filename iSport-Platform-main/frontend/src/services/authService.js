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
export const login = (payload) => post('/login', payload)
