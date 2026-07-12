import { useContext } from 'react'
import { BlockchainContext } from '../context/blockchain-context'

export function useBlockchain() {
  const context = useContext(BlockchainContext)
  if (!context) {
    throw new Error('useBlockchain debe usarse dentro de un BlockchainProvider')
  }
  return context
}
