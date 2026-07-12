const express = require('express')
const chatController = require('../controllers/chatController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

router.post('/message', authenticateToken, chatController.sendMessage)

module.exports = router
