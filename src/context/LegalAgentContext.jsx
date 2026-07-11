import { useCallback, useEffect, useState } from 'react'
import { LegalAgentContext } from './legal-agent-context'
import { handleUserMessage } from '../utils/legalEngine'

function readStoredConversation() {
  try {
    const raw = localStorage.getItem('conversation')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function LegalAgentProvider({ profile, language, children }) {
  const [conversation, setConversation] = useState(readStoredConversation)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    localStorage.setItem('conversation', JSON.stringify(conversation))
  }, [conversation])

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
    localStorage.removeItem('conversation')
  }, [])

  const value = { conversation, sendMessage, isTyping, clearConversation }

  return <LegalAgentContext.Provider value={value}>{children}</LegalAgentContext.Provider>
}
