const DIACRITICS_REGEX = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g')

const STOPWORDS = new Set([
  'de', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'un', 'una', 'es', 'que',
  'por', 'para', 'con', 'mi', 'tu', 'su', 'se', 'no', 'si', 'del', 'al',
  'lo', 'como', 'mas', 'pero', 'o', 'u', 'este', 'esta', 'ese', 'esa',
  'hay', 'cual', 'cuales', 'puedo', 'quiero', 'necesito', 'tengo', 'voy',
  'mis', 'tus', 'sus', 'muy', 'ya', 'me', 'te', 'nos', 'les', 'le',
  'unos', 'unas', 'sobre', 'entre', 'sin', 'hasta', 'desde', 'donde',
  'cuando', 'porque', 'tambien', 'the', 'and', 'for', 'with',
])

export function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .trim()
}

export function extractKeywords(text) {
  const normalized = normalize(text)
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean)
  return [...new Set(tokens.filter((token) => token.length > 2 && !STOPWORDS.has(token)))]
}
