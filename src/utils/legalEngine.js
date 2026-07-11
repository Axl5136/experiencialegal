import lawsData from '../data/laws.json'
import templatesData from '../data/templates.json'
import { normalize, extractKeywords } from './keywordMatcher'

function topicScore(topic, normalizedInput, keywords) {
  let score = 0
  for (const kw of topic.keyword) {
    const normKw = normalize(kw)
    if (normalizedInput.includes(normKw) || keywords.includes(normKw)) {
      score += 1
    }
  }
  return score
}

export function findBestMatch(userInput, role) {
  const normalizedInput = normalize(userInput)
  const keywords = extractKeywords(userInput)
  let best = null
  let bestScore = 0

  for (const law of lawsData.leyes) {
    if (!law.aplicable_a.includes(role)) continue
    for (const topic of law.temas) {
      const score = topicScore(topic, normalizedInput, keywords)
      if (score > bestScore) {
        bestScore = score
        best = { law, topic }
      }
    }
  }

  return bestScore > 0 ? best : null
}

function fillTemplate(str, vars) {
  return str.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '')
}

function formatDate(iso, language) {
  if (!iso) return ''
  const date = new Date(iso)
  return date.toLocaleDateString(language === 'en' ? 'en-US' : 'es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function handlePublicUserQuery(userInput, role, language) {
  const match = findBestMatch(userInput, role)
  const cta = templatesData.cta[language] ?? templatesData.cta.es

  if (match) {
    const content = language === 'en' ? match.topic.contenido_en : match.topic.contenido_es
    return `${content}\n\n${cta}`
  }

  const notFoundByRole = templatesData.generic_not_found[role] ?? templatesData.generic_not_found.tourist
  return notFoundByRole[language] ?? notFoundByRole.es
}

export function isStrategyQuestion(userInput) {
  const normalizedInput = normalize(userInput)
  return templatesData.blocked_keywords.some((kw) => normalizedInput.includes(normalize(kw)))
}

export function handlePrivateClientQuery(userInput, language, expediente, clienteNombre) {
  if (!expediente) {
    const fallback = templatesData.expediente_not_found
    return fallback[language] ?? fallback.es
  }

  if (isStrategyQuestion(userInput)) {
    const template = templatesData.blocked_strategy[language] ?? templatesData.blocked_strategy.es
    return fillTemplate(template, {
      cliente: clienteNombre ?? '',
      abogado: expediente.abogado_asignado,
      estado: expediente.estado,
      proxima_audiencia: formatDate(expediente.proxima_audiencia, language),
    })
  }

  const normalizedInput = normalize(userInput)

  if (/audiencia/.test(normalizedInput)) {
    return language === 'en'
      ? `Your next hearing is on ${formatDate(expediente.proxima_audiencia, language)} at ${expediente.lugar_audiencia}.`
      : `Tu próxima audiencia es el ${formatDate(expediente.proxima_audiencia, language)} en ${expediente.lugar_audiencia}.`
  }

  if (/documento/.test(normalizedInput)) {
    const docs = expediente.documentos.map((d) => `- ${d.nombre} (${d.tipo}, ${d.fecha_subida})`).join('\n')
    return language === 'en' ? `Documents in your case file:\n${docs}` : `Documentos en tu expediente:\n${docs}`
  }

  if (/(etapa|estado|cronologia|que paso|actualizacion|proximo)/.test(normalizedInput)) {
    const visibles = expediente.cronologia.filter((c) => c.visible_cliente)
    const timeline = visibles.map((c) => `- ${c.fecha}: ${c.titulo}`).join('\n')
    return language === 'en'
      ? `Current status: ${expediente.estado}\n\nTimeline:\n${timeline}`
      : `Estado actual: ${expediente.estado}\n\nCronología:\n${timeline}`
  }

  const fallback = templatesData.expediente_not_found
  return fallback[language] ?? fallback.es
}

export function handleUserMessage(userInput, profile, language) {
  if (!profile) return ''

  if (profile.role === 'tourist' || profile.role === 'hotelier') {
    return handlePublicUserQuery(userInput, profile.role, language)
  }

  if (profile.role === 'private_client') {
    return handlePrivateClientQuery(userInput, language, profile.expediente, profile.nombre)
  }

  return language === 'en'
    ? 'This assistant is designed for tourists, hoteliers, and private clients.'
    : 'Este asistente está diseñado para turistas, hoteleros y clientes con expediente.'
}
