const supabase = require('../utils/supabase')
const { generateChatResponse } = require('../utils/gemini')
const { retrieveRelevantChunks } = require('../utils/ragRetrieval')

const SYSTEM_PROMPTS = {
  turista:
    'Eres Asistente Legal para turistas en CDMX. Da información clara sobre leyes locales en lenguaje simple y amigable. Si algo es complejo, sugiere contactar un abogado. Responde en el idioma del usuario.',
  hotelero:
    'Eres Asistente Legal para dueños de negocios en CDMX. Informa sobre permisos y regulaciones con pasos prácticos, en lenguaje simple. Para casos complejos, sugiere contactar un abogado.',
  cliente:
    'Eres asistente del despacho para un cliente con expediente activo. Informa sobre el estado del caso, cronología, audiencias y contenido de sus documentos EN LENGUAJE SIMPLE Y NATURAL (el cliente no es abogado). PROHIBIDO: predicciones de resultado, estrategia legal, opiniones sobre "ganar o perder" — para eso, redirige amablemente a su abogado.',
  abogado: 'Eres asistente para abogados del despacho. Sé técnico y detallado.',
}

const getSystemPrompt = (role, expediente = null) => {
  let prompt = SYSTEM_PROMPTS[role] || SYSTEM_PROMPTS.turista

  if (role === 'cliente' && expediente) {
    prompt += `\n\nDATOS DEL EXPEDIENTE:\nNúmero: ${expediente.numero}\nTipo: ${expediente.tipo_caso}\nEstado: ${expediente.estado}\nInicio: ${expediente.fecha_inicio}\nPróxima audiencia: ${expediente.proxima_audiencia || 'sin agendar'}`
  }

  return prompt
}

// Defensa en profundidad además del system prompt.
const STRATEGY_KEYWORDS = [
  'voy a ganar',
  'vamos a ganar',
  'probabilidad de ganar',
  'chances',
  'estrategia de defensa',
]

const sendMessage = async (req, res) => {
  try {
    const { message, expedienteId } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message no puede estar vacío' })
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.userId)
      .single()

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }

    if (user.role === 'cliente' && STRATEGY_KEYWORDS.some((k) => message.toLowerCase().includes(k))) {
      const blocked =
        'Esa es una pregunta importante que merece la atención directa de tu abogado. Te recomiendo contactar a tu abogado asignado para hablar de estrategia y expectativas del caso. Yo puedo ayudarte con el estado del caso, tus documentos y próximas fechas.'
      const { data: logEntry } = await supabase
        .from('conversation_logs')
        .insert({
          user_id: req.user.userId,
          role: user.role,
          expediente_id: expedienteId || null,
          user_message: message,
          bot_response: blocked,
          tokens_used: 0,
          model: 'blocked',
        })
        .select()
        .single()
      return res.status(200).json({
        id: logEntry?.id,
        user_message: message,
        bot_response: blocked,
        blocked: true,
      })
    }

    let expediente = null
    let contextChunks = []

    if (user.role === 'cliente' && expedienteId) {
      const { data: exp } = await supabase
        .from('expedientes')
        .select('*')
        .eq('id', expedienteId)
        .single()

      if (exp && exp.cliente_id === req.user.userId) {
        expediente = exp
        contextChunks = await retrieveRelevantChunks(message, expedienteId, 5)
      }
    }

    const systemPrompt = getSystemPrompt(user.role, expediente)
    const response = await generateChatResponse(systemPrompt, message, contextChunks)

    const { data: logEntry, error } = await supabase
      .from('conversation_logs')
      .insert({
        user_id: req.user.userId,
        role: user.role,
        expediente_id: expedienteId || null,
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
    console.error('Error sendMessage:', err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = { sendMessage }
