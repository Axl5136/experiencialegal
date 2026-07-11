import seedExpedientes from '../data/expedientes.json'

const EXPEDIENTES_KEY = 'expedientes'

function readExpedientes() {
  const raw = localStorage.getItem(EXPEDIENTES_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      /* fall through to seed */
    }
  }
  const seeded = seedExpedientes.expedientes
  localStorage.setItem(EXPEDIENTES_KEY, JSON.stringify(seeded))
  return seeded
}

function writeExpedientes(list) {
  localStorage.setItem(EXPEDIENTES_KEY, JSON.stringify(list))
}

export function getExpedientes() {
  return readExpedientes()
}

export function getExpedienteById(id) {
  return readExpedientes().find((exp) => exp.id === id) ?? null
}

export function getExpedienteByHash(hash) {
  return readExpedientes().find((exp) => exp.hash_cliente === hash) ?? null
}

function nextExpedienteId(list) {
  const year = new Date().getFullYear()
  const nums = list
    .map((exp) => Number(exp.id.split('-').pop()))
    .filter((n) => !Number.isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `EXP-${year}-${String(next).padStart(3, '0')}`
}

function randomHash() {
  return Math.random().toString(36).slice(2, 10)
}

export function createExpediente(data) {
  const list = readExpedientes()
  const expediente = {
    ...data,
    id: nextExpedienteId(list),
    hash_cliente: randomHash(),
    cronologia: [],
    documentos: data.documentos ?? 0,
  }
  const updated = [...list, expediente]
  writeExpedientes(updated)
  return expediente
}

export function updateExpediente(id, updates) {
  const list = readExpedientes()
  const updated = list.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp))
  writeExpedientes(updated)
  return updated.find((exp) => exp.id === id)
}

export function addCronologiaEvento(id, evento) {
  const list = readExpedientes()
  const updated = list.map((exp) =>
    exp.id === id
      ? {
          ...exp,
          cronologia: [...(exp.cronologia ?? []), { id: `CRONO-${Date.now()}`, visible_cliente: true, ...evento }],
        }
      : exp,
  )
  writeExpedientes(updated)
  return updated.find((exp) => exp.id === id)
}
