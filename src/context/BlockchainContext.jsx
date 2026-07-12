import { useCallback, useState } from 'react'
import { ethers } from 'ethers'
import { BlockchainContext } from './blockchain-context'
import * as blockchainService from '../services/blockchainService'

export function BlockchainProvider({ children }) {
  const [wallet, setWallet] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCredentials = useCallback(async (address) => {
    try {
      const data = await blockchainService.getCredentials(address)
      setCredentials(data.credentials || [])
    } catch (err) {
      console.error('Error fetching credentials:', err)
    }
  }, [])

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!window.ethereum) {
        throw new Error('No se detectó una wallet (instala MetaMask)')
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]
      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()

      const message = 'Verificar que controlas esta wallet para Experiencia Legal'
      const signer = await provider.getSigner()
      const signature = await signer.signMessage(message)

      const data = await blockchainService.connectWallet(address, signature, message)

      setWallet({ address, verified: data.verified })
      setChainId(Number(network.chainId))

      await fetchCredentials(address)
      return data
    } catch (err) {
      console.error('Error connecting wallet:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchCredentials])

  const prepareSignature = useCallback(async (expedienteId, documentId) => {
    try {
      return await blockchainService.prepareSignature(expedienteId, documentId)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const signAndVerify = useCallback(
    async (eip712Data, expedienteId, documentId) => {
      try {
        setLoading(true)
        setError(null)

        if (!window.ethereum) throw new Error('No se detectó una wallet (instala MetaMask)')

        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()

        const signature = await signer.signTypedData(
          eip712Data.eip712Domain,
          eip712Data.types,
          eip712Data.value
        )

        return await blockchainService.verifySignature(
          expedienteId,
          documentId,
          signature,
          address,
          eip712Data.value.timestamp
        )
      } catch (err) {
        console.error('Error signing document:', err)
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const value = {
    wallet,
    connected: Boolean(wallet?.verified),
    chainId,
    credentials,
    loading,
    error,
    connectWallet,
    prepareSignature,
    signAndVerify,
    fetchCredentials,
  }

  return <BlockchainContext.Provider value={value}>{children}</BlockchainContext.Provider>
}
