const jwt = require('jsonwebtoken')

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '15m' })
}

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  })
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
  } catch {
    return null
  }
}

module.exports = { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken }
