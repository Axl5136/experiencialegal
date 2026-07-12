const supabase = require('../utils/supabase')

// PostgREST interpreta , ( ) dentro de .or() como separadores de condiciones;
// se quitan para que un texto de búsqueda arbitrario no pueda inyectar filtros extra.
const sanitizeForFilter = (text) => text.replace(/[,()]/g, '')

const searchClientes = async (req, res) => {
  try {
    const q = sanitizeForFilter((req.query.q || '').trim())

    if (!q) {
      return res.status(200).json([])
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, email')
      .eq('role', 'cliente')
      .or(`email.ilike.%${q}%,nombre.ilike.%${q}%`)
      .limit(10)

    if (error) throw error

    res.status(200).json(data)
  } catch (err) {
    console.error('Error searchClientes:', err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = { searchClientes }
