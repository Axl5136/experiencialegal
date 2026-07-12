const supabase = require('../utils/supabase')
const { generateChatResponse } = require('../utils/gemini')
const { retrieveRelevantChunks } = require('../utils/ragRetrieval')
const { validateFile, uploadToSupabase } = require('../utils/uploadHelper')
const { processInline } = require('./documentosController')

const SIGNED_URL_TTL_SECONDS = 600

// Duplicado intencional de chatController (system prompt + bloqueo de estrategia):
// este flujo no tiene JWT ni req.user, así que reusar el controller autenticado
// obligaría a ramificarlo por dentro. Si cambia el comportamiento de bloqueo/prompt
// para clientes, replicar el cambio aquí también.
const SYSTEM_PROMPT_CLIENTE =
  'Eres asistente del despacho para un cliente con expediente activo. Informa sobre el estado del caso, cronología, audiencias y contenido de sus documentos EN LENGUAJE SIMPLE Y NATURAL (el cliente no es abogado). PROHIBIDO: predicciones de resultado, estrategia legal, opiniones sobre "ganar o perder" — para eso, redirige amablemente a su abogado.'

const STRATEGY_KEYWORDS = [
  'voy a ganar',
  'vamos a ganar',
  'probabilidad de ganar',
  'chances',
  'estrategia de defensa',
]

async function findExpedienteByHash(hash) {
  const { data, error } = await supabase.from('expedientes').select('*').eq('link_hash', hash).single()
  if (error || !data) return null
  return data
}

const getPublicExpediente = async (req, res) => {
  try {
    const { hash } = req.params
    const expediente = await findExpedienteByHash(hash)

    if (!expediente) {
      return res.status(404).json({ error: 'Link inválido o expediente no encontrado' })
    }

    const { data: cronologia } = await supabase
      .from('cronologia')
      .select('id, fecha, evento, tipo, visible_cliente')
      .eq('expediente_id', expediente.id)
      .eq('visible_cliente', true)
      .order('fecha', { ascending: false })

    const { data: documentos } = await supabase
      .from('documents')
      .select('id, filename, file_type, created_at, uploaded_by_role, processing_status')
      .eq('expediente_id', expediente.id)
      .order('created_at', { ascending: false })

    res.status(200).json({
      numero: expediente.numero,
      tipo_caso: expediente.tipo_caso,
      estado: expediente.estado,
      fecha_inicio: expediente.fecha_inicio,
      proxima_audiencia: expediente.proxima_audiencia,
      descripcion: expediente.descripcion,
      cronologia: cronologia || [],
      documentos: documentos || [],
    })
  } catch (err) {
    console.error('Error getPublicExpediente:', err)
    res.status(500).json({ error: err.message })
  }
}

const getPublicDocumentUrl = async (req, res) => {
  try {
    const { hash, docId } = req.params
    const expediente = await findExpedienteByHash(hash)
    if (!expediente) {
      return res.status(404).json({ error: 'Link inválido o expediente no encontrado' })
    }

    const { data: doc } = await supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .eq('expediente_id', expediente.id)
      .single()

    if (!doc) {
      return res.status(404).json({ error: 'Documento no encontrado' })
    }

    const { data: signed, error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET)
      .createSignedUrl(doc.file_path, SIGNED_URL_TTL_SECONDS)

    if (error) throw error

    res.status(200).json({ url: signed.signedUrl, expires_in: SIGNED_URL_TTL_SECONDS })
  } catch (err) {
    console.error('Error getPublicDocumentUrl:', err)
    res.status(500).json({ error: err.message })
  }
}

const sendPublicChat = async (req, res) => {
  try {
    const { hash } = req.params
    const { message } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message no puede estar vacío' })
    }

    const expediente = await findExpedienteByHash(hash)
    if (!expediente) {
      return res.status(404).json({ error: 'Link inválido o expediente no encontrado' })
    }

    if (STRATEGY_KEYWORDS.some((k) => message.toLowerCase().includes(k))) {
      const blocked =
        'Esa es una pregunta importante que merece la atención directa de tu abogado. Te recomiendo contactar a tu abogado asignado para hablar de estrategia y expectativas del caso. Yo puedo ayudarte con el estado del caso, tus documentos y próximas fechas.'

      await supabase.from('conversation_logs').insert({
        user_id: expediente.cliente_id,
        role: 'cliente',
        expediente_id: expediente.id,
        user_message: message,
        bot_response: blocked,
        tokens_used: 0,
        model: 'blocked',
      })

      return res.status(200).json({ user_message: message, bot_response: blocked, blocked: true })
    }

    const contextChunks = await retrieveRelevantChunks(message, expediente.id, 5)

    const systemPrompt = `${SYSTEM_PROMPT_CLIENTE}\n\nDATOS DEL EXPEDIENTE:\nNúmero: ${expediente.numero}\nTipo: ${expediente.tipo_caso}\nEstado: ${expediente.estado}\nInicio: ${expediente.fecha_inicio}\nPróxima audiencia: ${expediente.proxima_audiencia || 'sin agendar'}`

    const response = await generateChatResponse(systemPrompt, message, contextChunks)

    const { data: logEntry, error } = await supabase
      .from('conversation_logs')
      .insert({
        user_id: expediente.cliente_id,
        role: 'cliente',
        expediente_id: expediente.id,
        user_message: message,
        bot_response: response.text,
        tokens_used: response.tokens,
        model: response.model,
      })
      .select()
      .single()

    if (error) throw error

    res.status(200).json({
      id: logEntry.id,
      user_message: message,
      bot_response: response.text,
      tokens_used: response.tokens,
      model: response.model,
      chunks_used: contextChunks.length,
      created_at: logEntry.created_at,
    })
  } catch (err) {
    console.error('Error sendPublicChat:', err)
    res.status(500).json({ error: err.message })
  }
}

const uploadPublicEvidencia = async (req, res) => {
  try {
    const { hash } = req.params

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const validation = validateFile(req.file)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    const expediente = await findExpedienteByHash(hash)
    if (!expediente) {
      return res.status(404).json({ error: 'Link inválido o expediente no encontrado' })
    }

    const result = await uploadToSupabase(req.file, expediente.id, expediente.cliente_id, 'cliente')
    await processInline(result.data.id)

    const { data: updated } = await supabase
      .from('documents')
      .select('id, filename, file_type, created_at, uploaded_by_role, processing_status')
      .eq('id', result.data.id)
      .single()

    res.status(201).json(updated || result.data)
  } catch (err) {
    console.error('Error uploadPublicEvidencia:', err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getPublicExpediente,
  getPublicDocumentUrl,
  sendPublicChat,
  uploadPublicEvidencia,
}
