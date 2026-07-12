const express = require('express')
const usersController = require('../controllers/usersController')
const { authenticateToken, requireRole } = require('../middleware/auth')

const router = express.Router()

router.get('/search', authenticateToken, requireRole(['abogado', 'admin']), usersController.searchClientes)

module.exports = router
