import { useState } from 'react'
import { AuthContext } from './auth-context'
import * as authService from '../services/authService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCurrentUser)

  const login = async (email, password) => {
    const loggedInUser = await authService.login(email, password)
    setUser(loggedInUser)
    return loggedInUser
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const value = { user, login, logout, isAuthenticated: Boolean(user) }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
