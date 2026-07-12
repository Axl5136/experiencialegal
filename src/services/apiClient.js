const DEFAULT_API_URL = 'https://experiencialegal-backend.vercel.app/api'

const BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function getToken() {
  return localStorage.getItem('token')
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken')
}

function setToken(token) {
  localStorage.setItem('token', token)
}

export function clearAuthStorage() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    setToken(data.token)
    return true
  } catch {
    return false
  }
}

async function request(path, { method = 'GET', body, headers = {}, isFormData = false, isRetry = false } = {}) {
  const token = getToken()
  const finalHeaders = { ...headers }
  if (!isFormData) finalHeaders['Content-Type'] = 'application/json'
  if (token) finalHeaders.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifica tu conexión.', 0, null)
  }

  if (response.status === 401 && !isRetry && getRefreshToken()) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return request(path, { method, body, headers, isFormData, isRetry: true })
    }
    clearAuthStorage()
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new ApiError('Sesión expirada', 401, null)
  }

  if (response.status === 204) return null

  let data = null
  try {
    data = await response.json()
  } catch {
    // Respuesta sin body JSON (p.ej. 204 ya manejado arriba, o error sin payload).
  }

  if (!response.ok) {
    const message = data?.error || (Array.isArray(data?.errors) ? data.errors.join(', ') : null) || 'Error en la solicitud'
    throw new ApiError(message, response.status, data)
  }

  return data
}

export const apiGet = (path) => request(path)
export const apiPost = (path, body) => request(path, { method: 'POST', body })
export const apiPut = (path, body) => request(path, { method: 'PUT', body })
export const apiDelete = (path) => request(path, { method: 'DELETE' })

export const apiUpload = (path, file, fieldName = 'file') => {
  const formData = new FormData()
  formData.append(fieldName, file)
  return request(path, { method: 'POST', body: formData, isFormData: true })
}
