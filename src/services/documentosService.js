import { apiGet, apiDelete, apiUpload } from './apiClient'

export function listByExpediente(expedienteId) {
  return apiGet(`/documentos/${expedienteId}`)
}

export function uploadAbogado(expedienteId, file) {
  return apiUpload(`/documentos/${expedienteId}/upload`, file)
}

export function uploadEvidenciaCliente(expedienteId, file) {
  return apiUpload(`/documentos/${expedienteId}/upload-evidencia`, file)
}

export function remove(docId) {
  return apiDelete(`/documentos/${docId}`)
}

export function getUrl(docId) {
  return apiGet(`/documentos/${docId}/url`)
}
