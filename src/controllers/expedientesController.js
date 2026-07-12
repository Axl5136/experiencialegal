const supabase = require('../utils/supabase')
const { validateExpediente } = require('../utils/validators')
const crypto = require('crypto')

const generateExpedienteNumber = async () => {
  const year = new Date().getFullYear()
  const { data } = await supabase
    .from('expedientes')
    .select('numero')
    .like('numero', `EXP-${year}%`)
    .order('numero', { ascending: false })
    .limit(1)

  const lastNumber = data && data.length > 0 ? parseInt(data[0].numero.split('-')[2], 10) : 0

  return `EXP-${year}-${String(lastNumber + 1).padStart(3, '0')}`
}

const getAllExpedientes = async (req, res) => {
  try {
    const { estado, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    let query = supabase.from('expedientes').select('*', { count: 'exact' })

    if (estado) query = query.eq('estado', estado)

    if (req.user.role === 'cliente') {
      query = query.eq('cliente_id', req.user.userId)
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) throw error

    res.status(200).json({
      data,
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    })
  } catch (err) {
    console.error('Error getExpedientes:', err)
    res.status(500).json({ error: err.message })
  }
}

const getExpedienteById = async (req, res) => {
  try {
    const { id } = req.params

    const { data: expediente, error } = await supabase
      .from('expedientes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (req.user.role === 'cliente' && expediente.cliente_id !== req.user.userId) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    const { data: cronologia } = await supabase
      .from('cronologia')
      .select('*')
      .eq('expediente_id', id)
      .order('fecha', { ascending: false })

    const { data: documentos } = await supabase
      .from('documents')
      .select('*')
      .eq('expediente_id', id)
      .order('created_at', { ascending: false })

    res.status(200).json({
      ...expediente,
      cronologia,
      documentos,
    })
  } catch (err) {
    console.error('Error getExpedienteById:', err)
    res.status(500).json({ error: err.message })
  }
}

const createExpediente = async (req, res) => {
  try {
    if (req.user.role !== 'abogado' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Solo abogados pueden crear expedientes' })
    }

    const { cliente_id, tipo_caso, estado, fecha_inicio, proxima_audiencia, descripcion } =
      req.body

    const validation = validateExpediente(req.body)
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors })
    }

    const numero = await generateExpedienteNumber()
    const linkHash = crypto.randomBytes(16).toString('hex')

    const { data, error } = await supabase
      .from('expedientes')
      .insert({
        numero,
        cliente_id,
        abogado_id: req.user.userId,
        tipo_caso,
        estado,
        fecha_inicio,
        proxima_audiencia,
        descripcion,
        link_hash: linkHash,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (err) {
    console.error('Error createExpediente:', err)
    res.status(500).json({ error: err.message })
  }
}

const updateExpediente = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data: expediente } = await supabase
      .from('expedientes')
      .select('*')
      .eq('id', id)
      .single()

    if (!expediente) {
      return res.status(404).json({ error: 'Expediente no encontrado' })
    }

    if (expediente.abogado_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    const { data, error } = await supabase
      .from('expedientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.status(200).json(data)
  } catch (err) {
    console.error('Error updateExpediente:', err)
    res.status(500).json({ error: err.message })
  }
}

const deleteExpediente = async (req, res) => {
  try {
    const { id } = req.params

    const { data: expediente } = await supabase
      .from('expedientes')
      .select('*')
      .eq('id', id)
      .single()

    if (!expediente) {
      return res.status(404).json({ error: 'Expediente no encontrado' })
    }

    if (expediente.abogado_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    const { error } = await supabase.from('expedientes').delete().eq('id', id)

    if (error) throw error

    res.status(204).send()
  } catch (err) {
    console.error('Error deleteExpediente:', err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getAllExpedientes,
  getExpedienteById,
  createExpediente,
  updateExpediente,
  deleteExpediente,
}
