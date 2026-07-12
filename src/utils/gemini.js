const CHAT_MODEL = 'gemini-3.5-flash'
// gemini-1.5-flash y text-embedding-004 ya están retirados para keys nuevas
// (verificado en vivo contra /v1beta/models). gemini-embedding-001 soporta
// outputDimensionality configurable — se pide 768 para calzar con pgvector.
const EMBEDDING_MODEL = 'gemini-embedding-001'
const EMBEDDING_DIMS = 768
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

async function generateEmbedding(text) {
  const url = `${API_BASE}/${EMBEDDING_MODEL}:embedContent?key=${process.env.GEMINI_API_KEY}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      outputDimensionality: EMBEDDING_DIMS,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    const err = new Error(data.error?.message || 'Error generando embedding')
    err.status = res.status
    throw err
  }

  return data.embedding.values
}

// Secuencial con pausa: respeta el rate limit del free tier de embeddings.
async function generateEmbeddingsBatch(texts) {
  const embeddings = []
  for (const text of texts) {
    const emb = await generateEmbedding(text)
    embeddings.push(emb)
    await new Promise((r) => setTimeout(r, 100))
  }
  return embeddings
}

// Sin "thinking": para preguntas cortas no necesita razonamiento profundo,
// así se mantiene la latencia y el costo bajos.
async function generateChatResponse(systemPrompt, userMessage, contextChunks = []) {
  let fullPrompt = systemPrompt

  if (contextChunks.length > 0) {
    fullPrompt += `\n\n=== DOCUMENTOS DEL EXPEDIENTE (contexto) ===\n`
    contextChunks.forEach((chunk, i) => {
      fullPrompt += `\n[Fragmento ${i + 1}]:\n${chunk.content}\n`
    })
    fullPrompt += `\n=== FIN DOCUMENTOS ===\n\nResponde usando SOLO la información de los documentos cuando la pregunta sea sobre ellos. Si la respuesta no está en los documentos, dilo claramente. Responde en lenguaje natural, simple y amigable — el usuario no es abogado.`
  }

  const url = `${API_BASE}/${CHAT_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: fullPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
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
    model: data.modelVersion || CHAT_MODEL,
  }
}

// Gemini Vision para describir/transcribir imágenes (mismo modelo de chat).
async function describeImage(buffer, mimeType) {
  const url = `${API_BASE}/${CHAT_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Describe detalladamente el contenido de esta imagen. Si contiene texto, transcríbelo completo. Si es una foto de evidencia, describe qué se ve.',
            },
            { inlineData: { mimeType, data: buffer.toString('base64') } },
          ],
        },
      ],
      generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    const err = new Error(data.error?.message || 'Error describiendo imagen')
    err.status = res.status
    throw err
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

module.exports = { generateEmbedding, generateEmbeddingsBatch, generateChatResponse, describeImage }
