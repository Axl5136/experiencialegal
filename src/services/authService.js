import { apiPost, clearAuthStorage } from './apiClient'
import { mapRoleFromBackend } from './roles'

function persistSession({ token, refreshToken, user }) {
  const mappedUser = { ...user, role: mapRoleFromBackend(user.role) }
  localStorage.setItem('token', token)
  localStorage.setItem('refreshToken', refreshToken)
  localStorage.setItem('user', JSON.stringify(mappedUser))
  return mappedUser
}

export async function login(email, password) {
  const data = await apiPost('/auth/login', { email, password })
  return persistSession(data)
}

export async function logout() {
  const refreshToken = localStorage.getItem('refreshToken')
  try {
    await apiPost('/auth/logout', { refreshToken })
  } catch {
    // Si falla el logout remoto igual limpiamos la sesión local.
  } finally {
    clearAuthStorage()
  }
}

export async function refresh() {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error('No hay refreshToken')
  const data = await apiPost('/auth/refresh', { refreshToken })
  localStorage.setItem('token', data.token)
  return data.token
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('token'))
}
