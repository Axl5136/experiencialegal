require('dotenv').config({ path: require('path').join(__dirname, '.env.local') })
const app = require('./src/app')
const blockchainInteraction = require('./src/utils/blockchainInteraction')

const PORT = process.env.PORT || 3000

blockchainInteraction.initBlockchain().catch((err) => console.error('Blockchain init error:', err.message))

app.listen(PORT, () => {
  console.log(`Servidor Backend ejecutando en http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`Supabase: ${process.env.SUPABASE_URL}`)
})
