import { apiGet, apiPost, apiUpload } from './apiClient'

export function getExpediente(hash) {
  return apiGet(`/public/cliente/${hash}`)
}

export function sendMessage(hash, message) {
  return apiPost(`/public/cliente/${hash}/chat`, { message })
}

export function uploadEvidencia(hash, file) {
  return apiUpload(`/public/cliente/${hash}/upload-evidencia`, file)
}

export function getDocumentUrl(hash, docId) {
  return apiGet(`/public/cliente/${hash}/documento/${docId}/url`)
}
