const supabase = require('../utils/supabase')
const { uploadToSupabase } = require('../utils/uploadHelper')
const { processDocument } = require('../utils/documentProcessor')

// En Vercel serverless no hay garantía de que un proceso "fire-and-forget"
// termine después de responder (la función puede matarse en cuanto se envía
// la respuesta) — por eso se espera el procesamiento antes de responder.
// Si falla el procesamiento, el documento igual se sube (no se pierde el
// archivo); solo queda con processing_status = 'failed' y se puede
// reintentar vía POST /:docId/reprocess.
async function processInline(documentId) {
  try {
    await processDocument(documentId)
  } catch (err) {
    console.error('Procesamiento de documento falló:', err.message)
  }
}

const getDocumentosByExpediente = async (req, res) => {
  try {
    const { expedienteId } = req.params

    const { data: expediente } = await supabase
      .from('expedientes')
      .select('*')
      .eq('id', expedienteId)
      .single()

    if (!expediente) {
      return res.status(404).json({ error: 'Expediente no encontrado' })
    }

    if (req.user.role === 'cliente' && expediente.cliente_id !== req.user.userId) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('expediente_id', expedienteId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.status(200).json(documents)
  } catch (err) {
    console.error('Error getDocumentos:', err)
    res.status(500).json({ error: err.message })
  }
}

const uploadDocumento = async (req, res) => {
  try {
    const { expedienteId } = req.params

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { data: expediente } = await supabase
      .from('expedientes')
      .select('*')
      .eq('id', expedienteId)
      .single()

    if (!expediente) {
      return res.status(404).json({ error: 'Expediente no encontrado' })
    }

    if (req.user.role !== 'abogado' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Solo abogados pueden subir documentos' })
    }

    const result = await uploadToSupabase(req.file, expedienteId, req.user.userId, 'abogado')
    await processInline(result.data.id)

    const { data: updated } = await supabase
      .from('documents')
      .select('*')
      .eq('id', result.data.id)
      .single()

    res.status(201).json(updated || result.data)
  } catch (err) {
    console.error('Error uploadDocumento:', err)
    res.status(500).json({ error: err.message })
  }
}

const uploadEvidenciaCliente = async (req, res) => {
  try {
    const { expedienteId } = req.params

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { data: expediente } = await supabase
      .from('expedientes')
      .select('*')
      .eq('id', expedienteId)
      .single()

    if (!expediente) {
      return res.status(404).json({ error: 'Expediente no encontrado' })
    }

    if (req.user.role !== 'cliente') {
      return res.status(403).json({ error: 'Solo clientes pueden subir evidencia aquí' })
    }

    if (expediente.cliente_id !== req.user.userId) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    const result = await uploadToSupabase(req.file, expedienteId, req.user.userId, 'cliente')
    await processInline(result.data.id)

    const { data: updated } = await supabase
      .from('documents')
      .select('*')
      .eq('id', result.data.id)
      .single()

    res.status(201).json(updated || result.data)
  } catch (err) {
    console.error('Error uploadEvidenciaCliente:', err)
    res.status(500).json({ error: err.message })
  }
}

const deleteDocumento = async (req, res) => {
  try {
    const { docId } = req.params

    const { data: doc } = await supabase.from('documents').select('*').eq('id', docId).single()

    if (!doc) {
      return res.status(404).json({ error: 'Documento no encontrado' })
    }

    if (doc.uploaded_by !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    await supabase.storage.from(process.env.SUPABASE_STORAGE_BUCKET).remove([doc.file_path])

    const { error } = await supabase.from('documents').delete().eq('id', docId)

    if (error) throw error

    res.status(204).send()
  } catch (err) {
    console.error('Error deleteDocumento:', err)
    res.status(500).json({ error: err.message })
  }
}

const reprocessDocumento = async (req, res) => {
  try {
    const { docId } = req.params

    const { data: doc } = await supabase.from('documents').select('*').eq('id', docId).single()
    if (!doc) {
      return res.status(404).json({ error: 'Documento no encontrado' })
    }

    const result = await processDocument(docId)
    res.status(200).json(result)
  } catch (err) {
    console.error('Error reprocessDocumento:', err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getDocumentosByExpediente,
  uploadDocumento,
  uploadEvidenciaCliente,
  deleteDocumento,
  reprocessDocumento,
  processInline,
}
