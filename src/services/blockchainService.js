import { apiGet, apiPost } from './apiClient'

export const connectWallet = (address, signature, message) =>
  apiPost('/blockchain/wallet/connect', { address, signature, message })

export const getWalletStatus = () => apiGet('/blockchain/wallet/status')

export const getCredentials = (walletAddress) => apiGet(`/blockchain/credentials/verify/${walletAddress}`)

export const prepareSignature = (expedienteId, documentId) =>
  apiPost('/blockchain/signature/prepare', { expediente_id: expedienteId, document_id: documentId })

export const verifySignature = (expedienteId, documentId, signature, address, timestamp) =>
  apiPost('/blockchain/signature/verify', {
    expediente_id: expedienteId,
    document_id: documentId,
    signature,
    address,
    timestamp,
  })

export const getSignatureProof = (certId) => apiGet(`/blockchain/signature/verify/${certId}`)
