import { apiGet } from './apiClient'

export function searchClientes(q) {
  const params = new URLSearchParams({ q })
  return apiGet(`/users/search?${params.toString()}`)
}
