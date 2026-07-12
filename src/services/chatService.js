import { apiPost } from './apiClient'

export function sendMessage(message, expedienteId) {
  return apiPost('/chat/message', { message, expedienteId })
}
