require('dotenv').config({ path: require('path').join(__dirname, '.env.local') })
const app = require('./src/app')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor Backend ejecutando en http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`Supabase: ${process.env.SUPABASE_URL}`)
})
