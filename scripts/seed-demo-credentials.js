// Conecta wallets sinteticas para juan@demo.com (el cliente de login real) y le
// emite credenciales SBT reales en Sepolia, para que la demo muestre el sidebar
// ya con credenciales sin depender de MetaMask en vivo.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })
const { ethers } = require('../hardhat-contracts/node_modules/ethers')

const API_URL = process.env.SEED_API_URL || 'https://experiencialegal-backend.vercel.app/api'

async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`Login falló para ${email}: ${res.status}`)
  return (await res.json()).token
}

async function connectWallet(token, wallet) {
  const message = 'Verificar que controlas esta wallet para Experiencia Legal'
  const signature = await wallet.signMessage(message)
  const res = await fetch(`${API_URL}/blockchain/wallet/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ address: wallet.address, signature, message }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`connectWallet falló: ${JSON.stringify(data)}`)
  return data
}

async function emitCredential(abogadoToken, userId, credentialType, expiryDays) {
  const res = await fetch(`${API_URL}/blockchain/credentials/emit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${abogadoToken}` },
    body: JSON.stringify({ user_id: userId, credential_type: credentialType, expiry_days: expiryDays }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`emitCredential falló: ${JSON.stringify(data)}`)
  return data
}

async function main() {
  const clienteToken = await login('juan@demo.com', 'demo123')
  const abogadoToken = await login('maria@experiencialegal.com', 'demo123')

  const wallet = ethers.Wallet.createRandom()
  console.log('Wallet generada para juan@demo.com:', wallet.address)

  await connectWallet(clienteToken, wallet)
  console.log('  wallet conectada')

  // Obtenemos el user_id real desde /auth/login (viene en el JSON de login, no en el token de wallet/connect)
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'juan@demo.com', password: 'demo123' }),
  })
  const loginData = await loginRes.json()
  const userId = loginData.user.id

  const credenciales = [
    { credential_type: 'identidad_verificada', expiry_days: 365 },
    { credential_type: 'cliente_recurrente', expiry_days: 730 },
  ]

  for (const c of credenciales) {
    const result = await emitCredential(abogadoToken, userId, c.credential_type, c.expiry_days)
    console.log(`  credencial emitida: ${c.credential_type} (tx ${result.txHash})`)
  }

  console.log('\nListo. juan@demo.com ya tiene wallet conectada + 2 credenciales reales en Sepolia.')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
