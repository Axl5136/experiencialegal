const supabase = require('../utils/supabase')
const { callGeminiAPI } = require('../utils/gemini')

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

    let expediente = null
    if (user.role === 'cliente' && expedienteId) {
      const { data: exp } = await supabase
        .from('expedientes')
        .select('*')
        .eq('id', expedienteId)
        .single()

      if (exp && exp.cliente_id === req.user.userId) {
        expediente = exp
      }
    }

    const response = await callGeminiAPI(message, user.role, expediente)

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
      created_at: logEntry.created_at,
    })
  } catch (err) {
    console.error('Error sendMessage:', err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = { sendMessage }
