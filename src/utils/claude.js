const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// claude-3-sonnet-20240229 fue retirado (21 jul 2025). Se usa el modelo actual
// recomendado por defecto. Sin "thinking" extendido: es un asistente de
// preguntas cortas, no necesita razonamiento profundo, y así se mantiene
// la latencia baja para el chat.
const MODEL = 'claude-opus-4-8'

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

async function callClaudeAPI(message, role, expediente = null) {
  const systemPrompt = getSystemPrompt(role, expediente)

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: message }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')

  return {
    text: textBlock ? textBlock.text : '',
    tokens: response.usage.input_tokens + response.usage.output_tokens,
    model: response.model,
  }
}

module.exports = { callClaudeAPI, getSystemPrompt }
