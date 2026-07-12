const supabase = require('./supabase')
const { extractTextFromPDF, extractTextFromImage, chunkText } = require('./textExtractor')
const { generateEmbeddingsBatch } = require('./gemini')

const processDocument = async (documentId) => {
  try {
    await supabase.from('documents').update({ processing_status: 'processing' }).eq('id', documentId)

    const { data: doc } = await supabase.from('documents').select('*').eq('id', documentId).single()
    if (!doc) throw new Error('Documento no encontrado')

    const { data: fileData, error: dlError } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET)
      .download(doc.file_path)
    if (dlError) throw dlError

    const buffer = Buffer.from(await fileData.arrayBuffer())

    let text = ''
    if (doc.file_type === 'pdf') {
      text = await extractTextFromPDF(buffer)
    } else if (['jpg', 'jpeg', 'png'].includes(doc.file_type)) {
      const mime = doc.file_type === 'png' ? 'image/png' : 'image/jpeg'
      text = await extractTextFromImage(buffer, mime)
    } else {
      text = `Documento: ${doc.filename} (tipo ${doc.file_type}, subido por ${doc.uploaded_by_role})`
    }

    if (!text || text.trim().length < 10) {
      throw new Error('No se pudo extraer texto del documento')
    }

    const chunks = chunkText(text)
    const embeddings = await generateEmbeddingsBatch(chunks)

    await supabase.from('document_chunks').delete().eq('document_id', documentId)

    const rows = chunks.map((content, i) => ({
      document_id: documentId,
      expediente_id: doc.expediente_id,
      chunk_index: i,
      content,
      embedding: embeddings[i],
      token_count: Math.ceil(content.length / 4),
    }))

    const { error: insertError } = await supabase.from('document_chunks').insert(rows)
    if (insertError) throw insertError

    await supabase
      .from('documents')
      .update({ processing_status: 'completed', extracted_text_length: text.length })
      .eq('id', documentId)

    return { success: true, chunks: chunks.length }
  } catch (err) {
    console.error('Error procesando documento:', err.message)
    await supabase.from('documents').update({ processing_status: 'failed' }).eq('id', documentId)
    throw err
  }
}

module.exports = { processDocument }
