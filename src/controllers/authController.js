const bcrypt = require('bcryptjs')
const supabase = require('../utils/supabase')
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt')
const { validateEmail, validatePassword } = require('../utils/validators')

const DEMO_USERS = {
  'turista@demo.com': { password: 'demo123', nombre: 'Michael (Turista)', role: 'turista' },
  'hotelero@demo.com': { password: 'demo123', nombre: 'Carlos (Hotelero)', role: 'hotelero' },
  'juan@demo.com': { password: 'demo123', nombre: 'Juan Pérez (Cliente)', role: 'cliente' },
  'maria@experiencialegal.com': {
    password: 'demo123',
    nombre: 'María López (Abogado)',
    role: 'abogado',
  },
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password requeridos' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password debe tener mínimo 6 caracteres' })
    }

    const demoUser = DEMO_USERS[email]
    if (!demoUser || demoUser.password !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()

    let userId
    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: await bcrypt.hash(password, 10),
          nombre: demoUser.nombre,
          role: demoUser.role,
          estado: 'activo',
        })
        .select()
        .single()

      if (createError) throw createError
      userId = newUser.id
    } else {
      userId = user.id
    }

    const token = generateToken(userId, demoUser.role)
    const refreshToken = generateRefreshToken(userId)

    await supabase.from('sessions').insert({
      user_id: userId,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    await supabase.from('users').update({ last_login: new Date() }).eq('id', userId)

    res.status(200).json({
      token,
      refreshToken,
      user: { id: userId, email, nombre: demoUser.nombre, role: demoUser.role },
    })
  } catch (err) {
    console.error('Error login:', err)
    res.status(500).json({ error: err.message })
  }
}

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken requerido' })
    }

    const decoded = verifyRefreshToken(refreshToken)
    if (!decoded) {
      return res.status(401).json({ error: 'refreshToken inválido' })
    }

    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .single()

    if (!session) {
      return res.status(401).json({ error: 'refreshToken no encontrado' })
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }

    const newToken = generateToken(decoded.userId, user.role)

    res.status(200).json({ token: newToken })
  } catch (err) {
    console.error('Error refresh:', err)
    res.status(500).json({ error: err.message })
  }
}

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      await supabase.from('sessions').delete().eq('refresh_token', refreshToken)
    }

    res.status(200).json({ message: 'Logout exitoso' })
  } catch (err) {
    console.error('Error logout:', err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = { login, refresh, logout }
