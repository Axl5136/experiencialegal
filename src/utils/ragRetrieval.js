const supabase = require('./supabase')
const { generateEmbedding } = require('./gemini')

const retrieveRelevantChunks = async (query, expedienteId, topK = 5) => {
  const queryEmbedding = await generateEmbedding(query)

  const { data: chunks, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_expediente_id: expedienteId,
    match_threshold: 0.4,
    match_count: topK,
  })

  if (error) {
    console.error('Error en búsqueda vectorial:', error.message)
    return []
  }

  return chunks || []
}

module.exports = { retrieveRelevantChunks }
