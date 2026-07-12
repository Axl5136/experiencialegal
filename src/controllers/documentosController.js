const supabase = require('../utils/supabase')
const { uploadToSupabase } = require('../utils/uploadHelper')

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

    res.status(201).json(result.data)
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

    res.status(201).json(result.data)
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

module.exports = {
  getDocumentosByExpediente,
  uploadDocumento,
  uploadEvidenciaCliente,
  deleteDocumento,
}
