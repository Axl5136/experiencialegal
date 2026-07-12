import { useCallback, useEffect, useMemo, useState } from 'react'
import { LegalAgentContext } from './legal-agent-context'
import { handleUserMessage } from '../utils/legalEngine'
import * as chatService from '../services/chatService'
import { isAuthenticated } from '../services/authService'

function storageKey(userId) {
  return `conversation_${userId ?? 'anonymous'}`
}

function readStoredConversation(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function LegalAgentProvider({ profile, language, expedienteId, children }) {
  const userId = profile?.id
  const [conversation, setConversation] = useState(() => readStoredConversation(userId))
  const [isTyping, setIsTyping] = useState(false)
  const hasPriorHistory = useMemo(() => readStoredConversation(userId).length > 0, [userId])

  useEffect(() => {
    localStorage.setItem(storageKey(userId), JSON.stringify(conversation))
  }, [conversation, userId])

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim()
      if (!trimmed) return

      const userMessage = {
        id: `msg-${Date.now()}-u`,
        sender: 'user',
        text: trimmed,
        timestamp: new Date().toISOString(),
        metadata: { role: profile?.role, language },
      }

      setConversation((prev) => [...prev, userMessage])
      setIsTyping(true)

      // Sin sesión real (p.ej. el flujo /cliente/:hash sin login) el backend
      // rechaza cualquier request porque todas sus rutas exigen JWT — en ese
      // caso se conserva el motor de keywords local como fallback.
      try {
        let responseText
        let metadata = { role: profile?.role, language }

        if (isAuthenticated()) {
          const res = await chatService.sendMessage(trimmed, expedienteId)
          responseText = res.bot_response
          metadata = { ...metadata, blocked: Boolean(res.blocked), chunksUsed: res.chunks_used ?? 0 }
        } else {
          responseText = handleUserMessage(trimmed, profile, language)
        }

        const botMessage = {
          id: `msg-${Date.now()}-b`,
          sender: 'bot',
          text: responseText,
          timestamp: new Date().toISOString(),
          metadata,
        }
        setConversation((prev) => [...prev, botMessage])
      } catch (err) {
        const errorMessage = {
          id: `msg-${Date.now()}-b`,
          sender: 'bot',
          text: err.message || 'Ocurrió un error al contactar al asistente. Intenta de nuevo.',
          timestamp: new Date().toISOString(),
          metadata: { role: profile?.role, language, error: true },
        }
        setConversation((prev) => [...prev, errorMessage])
      } finally {
        setIsTyping(false)
      }
    },
    [profile, language, expedienteId],
  )

  const clearConversation = useCallback(() => {
    setConversation([])
    localStorage.removeItem(storageKey(userId))
  }, [userId])

  const value = { conversation, sendMessage, isTyping, clearConversation, hasPriorHistory }

  return <LegalAgentContext.Provider value={value}>{children}</LegalAgentContext.Provider>
}
