import { useContext } from 'react'
import { LegalAgentContext } from '../context/legal-agent-context'

export function useLegalAgent() {
  const context = useContext(LegalAgentContext)
  if (!context) {
    throw new Error('useLegalAgent debe usarse dentro de un LegalAgentProvider')
  }
  return context
}
