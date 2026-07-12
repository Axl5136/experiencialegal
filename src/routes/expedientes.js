const express = require('express')
const expedientesController = require('../controllers/expedientesController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

router.get('/', authenticateToken, expedientesController.getAllExpedientes)
router.post('/', authenticateToken, expedientesController.createExpediente)
router.get('/:id', authenticateToken, expedientesController.getExpedienteById)
router.put('/:id', authenticateToken, expedientesController.updateExpediente)
router.delete('/:id', authenticateToken, expedientesController.deleteExpediente)
router.post('/:id/cronologia', authenticateToken, expedientesController.addCronologia)
router.delete('/:id/cronologia/:eventoId', authenticateToken, expedientesController.removeCronologia)

module.exports = router
