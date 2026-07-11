import { useMemo, useState } from 'react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useLoginValidation(email, password) {
  const [touched, setTouched] = useState({ email: false, password: false })

  const isEmailValid = EMAIL_REGEX.test(email.trim())
  const isPasswordValid = password.length >= 6

  const emailError = useMemo(() => {
    if (!touched.email || !email.trim()) return ''
    return isEmailValid ? '' : 'emailInvalid'
  }, [touched.email, email, isEmailValid])

  const passwordError = useMemo(() => {
    if (!touched.password || !password) return ''
    return isPasswordValid ? '' : 'passwordMin'
  }, [touched.password, password, isPasswordValid])

  const touchEmail = () => setTouched((t) => ({ ...t, email: true }))
  const touchPassword = () => setTouched((t) => ({ ...t, password: true }))
  const touchAll = () => setTouched({ email: true, password: true })

  return {
    emailError,
    passwordError,
    isEmailValid,
    isPasswordValid,
    touchEmail,
    touchPassword,
    touchAll,
  }
}
