const pdfParse = require('pdf-parse')
const { describeImage } = require('./gemini')

const extractTextFromPDF = async (buffer) => {
  const result = await pdfParse(buffer)
  return result.text
}

const extractTextFromImage = async (buffer, mimeType) => {
  return describeImage(buffer, mimeType)
}

// Chunking: fragmentos de ~1500 caracteres con overlap de 200.
const chunkText = (text, chunkSize = 1500, overlap = 200) => {
  const chunks = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunk = text.slice(start, end).trim()
    if (chunk.length > 50) chunks.push(chunk)
    start += chunkSize - overlap
  }
  return chunks
}

module.exports = { extractTextFromPDF, extractTextFromImage, chunkText }
