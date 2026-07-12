import { apiGet, apiPost, apiPut, apiDelete } from './apiClient'

// El mock usaba tipo_caso/estado en español con mayúsculas y acentos; la tabla
// `expedientes` del backend usa enums en minúsculas sin acentos. Este es el
// único punto de traducción entre ambos formatos.
export const TIPO_CASO_TO_BACKEND = {
  Laboral: 'laboral',
  Penal: 'penal',
  Civil: 'civil',
  Comercial: 'comercial',
}

export const TIPO_CASO_TO_LABEL = {
  laboral: 'Laboral',
  penal: 'Penal',
  civil: 'Civil',
  comercial: 'Comercial',
}

export const ESTADO_TO_BACKEND = {
  'En investigación': 'investigacion',
  'En juicio': 'juicio',
  Sentencia: 'sentencia',
  Cerrado: 'cerrado',
}

export const ESTADO_TO_LABEL = {
  investigacion: 'En investigación',
  juicio: 'En juicio',
  sentencia: 'Sentencia',
  cerrado: 'Cerrado',
}

function adaptCronologia(cronologia = []) {
  return cronologia.map((evento) => ({
    id: evento.id,
    fecha: evento.fecha,
    tipo: evento.tipo,
    titulo: evento.evento,
    visible_cliente: evento.visible_cliente,
  }))
}

function adaptExpediente(exp) {
  if (!exp) return null
  return {
    ...exp,
    id: exp.id,
    numero: exp.numero,
    cliente: exp.cliente_id,
    abogado: exp.abogado_id,
    tipo_caso: TIPO_CASO_TO_LABEL[exp.tipo_caso] ?? exp.tipo_caso,
    estado: ESTADO_TO_LABEL[exp.estado] ?? exp.estado,
    hash_cliente: exp.link_hash,
    cronologia: exp.cronologia ? adaptCronologia(exp.cronologia) : undefined,
    documentos: exp.documentos ?? undefined,
  }
}

export async function getAll(filtros = {}) {
  const params = new URLSearchParams()
  if (filtros.estado) params.set('estado', ESTADO_TO_BACKEND[filtros.estado] ?? filtros.estado)
  if (filtros.page) params.set('page', filtros.page)
  if (filtros.limit) params.set('limit', filtros.limit)

  const query = params.toString()
  const response = await apiGet(`/expedientes${query ? `?${query}` : ''}`)
  return {
    ...response,
    data: response.data.map(adaptExpediente),
  }
}

export async function getById(id) {
  const exp = await apiGet(`/expedientes/${id}`)
  return adaptExpediente(exp)
}

export async function create(form) {
  const payload = {
    cliente_id: form.cliente_id,
    tipo_caso: TIPO_CASO_TO_BACKEND[form.tipo_caso] ?? form.tipo_caso,
    estado: ESTADO_TO_BACKEND[form.estado] ?? form.estado,
    fecha_inicio: form.fecha_inicio,
    proxima_audiencia: form.proxima_audiencia ? form.proxima_audiencia.split('T')[0] : null,
    descripcion: form.descripcion,
  }
  const created = await apiPost('/expedientes', payload)
  return adaptExpediente(created)
}

export async function update(id, draft) {
  const payload = {}
  if (draft.tipo_caso) payload.tipo_caso = TIPO_CASO_TO_BACKEND[draft.tipo_caso] ?? draft.tipo_caso
  if (draft.estado) payload.estado = ESTADO_TO_BACKEND[draft.estado] ?? draft.estado
  if (draft.fecha_inicio) payload.fecha_inicio = draft.fecha_inicio
  if (draft.proxima_audiencia) payload.proxima_audiencia = draft.proxima_audiencia.split('T')[0]
  if (draft.descripcion !== undefined) payload.descripcion = draft.descripcion

  const updated = await apiPut(`/expedientes/${id}`, payload)
  return adaptExpediente(updated)
}

export async function remove(id) {
  await apiDelete(`/expedientes/${id}`)
}
