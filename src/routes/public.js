const express = require('express')
const upload = require('../middleware/uploadHandler')
const publicController = require('../controllers/publicController')

const router = express.Router()

router.get('/cliente/:hash', publicController.getPublicExpediente)
router.get('/cliente/:hash/documento/:docId/url', publicController.getPublicDocumentUrl)
router.post('/cliente/:hash/chat', publicController.sendPublicChat)
router.post('/cliente/:hash/upload-evidencia', upload.single('file'), publicController.uploadPublicEvidencia)

module.exports = router
