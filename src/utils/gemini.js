const MODEL = 'gemini-3.5-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

// Sin "thinking": es un asistente de preguntas cortas, no necesita razonamiento
// profundo, y así se mantiene la latencia y el costo bajos para el chat.
const SYSTEM_PROMPTS = {
  turista: `Eres Asistente Legal para turistas en CDMX. Tu trabajo es dar información CLARA sobre leyes locales. PROHIBIDO: Dar asesoría legal compleja. Si es complejo, redirige a abogado. Sé breve y práctico.`,

  hotelero: `Eres Asistente Legal para dueños de negocios en CDMX. Tu trabajo es INFORMAR sobre permisos, regulaciones, procedimientos. Puedes dar PROCESOS paso a paso. PROHIBIDO: Asesoría estratégica. Redirige a abogado para casos complejos.`,

  cliente: `Eres asistente para cliente con expediente en nuestro despacho. Tu ROL: Informar estado del caso, cronología, próximas audiencias. PROHIBIDO: Estrategia legal, interpretaciones, predicciones. Siempre redirige a abogado para decisiones. Sé empático pero profesional.`,

  abogado: `Eres asistente para abogados del despacho. Tu rol: Ayudar con búsquedas de jurisprudencia, análisis de casos, redacción de escritos. Sé detallado y técnico.`,
}

function getSystemPrompt(role, expediente = null) {
  let prompt = SYSTEM_PROMPTS[role] || SYSTEM_PROMPTS.turista

  if (role === 'cliente' && expediente) {
    prompt += `\n\nCONTEXTO DEL CLIENTE:\nExpediente: ${expediente.numero}\nTipo Caso: ${expediente.tipo_caso}\nEstado: ${expediente.estado}\nPróxima Audiencia: ${expediente.proxima_audiencia}\nAbogado: ${expediente.abogado}\n`
  }

  return prompt
}

async function callGeminiAPI(message, role, expediente = null) {
  const systemPrompt = getSystemPrompt(role, expediente)

  const url = `${API_BASE}/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    const err = new Error(data.error?.message || 'Error calling Gemini API')
    err.status = res.status
    throw err
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const usage = data.usageMetadata || {}

  return {
    text,
    tokens: (usage.promptTokenCount || 0) + (usage.candidatesTokenCount || 0),
    model: data.modelVersion || MODEL,
  }
}

module.exports = { callGeminiAPI, getSystemPrompt }
