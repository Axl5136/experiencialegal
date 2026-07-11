import { useCallback, useEffect, useMemo, useState } from 'react'
import { LegalAgentContext } from './legal-agent-context'
import { handleUserMessage } from '../utils/legalEngine'

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

export function LegalAgentProvider({ profile, language, children }) {
  const userId = profile?.id
  const [conversation, setConversation] = useState(() => readStoredConversation(userId))
  const [isTyping, setIsTyping] = useState(false)
  const hasPriorHistory = useMemo(() => readStoredConversation(userId).length > 0, [userId])

  useEffect(() => {
    localStorage.setItem(storageKey(userId), JSON.stringify(conversation))
  }, [conversation, userId])

  const sendMessage = useCallback(
    (text) => {
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

      window.setTimeout(() => {
        const responseText = handleUserMessage(trimmed, profile, language)
        const botMessage = {
          id: `msg-${Date.now()}-b`,
          sender: 'bot',
          text: responseText,
          timestamp: new Date().toISOString(),
          metadata: { role: profile?.role, language },
        }
        setConversation((prev) => [...prev, botMessage])
        setIsTyping(false)
      }, 500)
    },
    [profile, language],
  )

  const clearConversation = useCallback(() => {
    setConversation([])
    localStorage.removeItem(storageKey(userId))
  }, [userId])

  const value = { conversation, sendMessage, isTyping, clearConversation, hasPriorHistory }

  return <LegalAgentContext.Provider value={value}>{children}</LegalAgentContext.Provider>
}
