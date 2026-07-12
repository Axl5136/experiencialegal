const { verifyToken } = require('../utils/jwt')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token no encontrado' })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }

  req.user = decoded
  next()
}

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado (rol insuficiente)' })
    }
    next()
  }
}

module.exports = { authenticateToken, requireRole }
