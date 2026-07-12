const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const errorHandler = require('./middleware/errorHandler')

const authRoutes = require('./routes/auth')
const expedientesRoutes = require('./routes/expedientes')
const documentosRoutes = require('./routes/documentos')
const chatRoutes = require('./routes/chat')
const healthRoutes = require('./routes/health')

const app = express()

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')

app.use(helmet())
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/expedientes', expedientesRoutes)
app.use('/api/documentos', documentosRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/health', healthRoutes)

app.use(errorHandler)

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

module.exports = app
