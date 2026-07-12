const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password) => {
  return Boolean(password) && password.length >= 6
}

const validateExpediente = (data) => {
  const errors = []
  if (!data.cliente_id) errors.push('cliente_id requerido')
  if (!data.tipo_caso) errors.push('tipo_caso requerido')
  if (!data.estado) errors.push('estado requerido')
  if (!data.fecha_inicio) errors.push('fecha_inicio requerida')
  return { valid: errors.length === 0, errors }
}

module.exports = { validateEmail, validatePassword, validateExpediente }
