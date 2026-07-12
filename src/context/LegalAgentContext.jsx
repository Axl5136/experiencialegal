import { useCallback, useEffect, useMemo, useState } from 'react'
import { LegalAgentContext } from './legal-agent-context'
import { handleUserMessage } from '../utils/legalEngine'
import * as chatService from '../services/chatService'
import * as publicClienteService from '../services/publicClienteService'
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

export function LegalAgentProvider({ profile, language, expedienteId, publicHash, children }) {
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

      // El flujo /cliente/:hash no tiene JWT: usa el endpoint público validado
      // por hash. Fuera de sesión y sin hash (estado roto) se cae al motor de
      // keywords local como último fallback.
      try {
        let responseText
        let metadata = { role: profile?.role, language }

        if (publicHash) {
          const res = await publicClienteService.sendMessage(publicHash, trimmed)
          responseText = res.bot_response
          metadata = { ...metadata, blocked: Boolean(res.blocked), chunksUsed: res.chunks_used ?? 0 }
        } else if (isAuthenticated()) {
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
    [profile, language, expedienteId, publicHash],
  )

  const clearConversation = useCallback(() => {
    setConversation([])
    localStorage.removeItem(storageKey(userId))
  }, [userId])

  const value = { conversation, sendMessage, isTyping, clearConversation, hasPriorHistory }

  return <LegalAgentContext.Provider value={value}>{children}</LegalAgentContext.Provider>
}
