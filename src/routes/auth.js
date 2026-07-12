const express = require('express')
const authController = require('../controllers/authController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

router.post('/login', authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authenticateToken, authController.logout)

module.exports = router
