const express = require('express')
const upload = require('../middleware/uploadHandler')
const documentosController = require('../controllers/documentosController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

router.get('/:expedienteId', authenticateToken, documentosController.getDocumentosByExpediente)
router.get('/:docId/url', authenticateToken, documentosController.getDocumentUrl)
router.post(
  '/:expedienteId/upload',
  authenticateToken,
  upload.single('file'),
  documentosController.uploadDocumento,
)
router.post(
  '/:expedienteId/upload-evidencia',
  authenticateToken,
  upload.single('file'),
  documentosController.uploadEvidenciaCliente,
)
router.delete('/:docId', authenticateToken, documentosController.deleteDocumento)
router.post('/:docId/reprocess', authenticateToken, documentosController.reprocessDocumento)

module.exports = router
