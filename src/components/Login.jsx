import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { useLoginValidation } from '../hooks/useLoginValidation'

const DEMO_CREDENTIALS = {
  tourist: { email: 'turista@demo.com', password: 'demo123' },
  hotelier: { email: 'hotelero@demo.com', password: 'demo123' },
  private_client: { email: 'juan@demo.com', password: 'demo123' },
  lawyer: { email: 'maria@experiencialegal.com', password: 'demo123' },
}

const inputBase =
  'w-full rounded-lg border-2 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 transition-colors duration-200 focus:outline-none'

function inputClasses(hasError) {
  if (hasError) {
    return `${inputBase} border-destructive bg-destructive/5 focus:border-destructive focus:ring-2 focus:ring-destructive/20`
  }
  return `${inputBase} border-border bg-muted focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20`
}

function Login() {
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'tourist'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle')
  const { login } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const {
    emailError,
    passwordError,
    isEmailValid,
    isPasswordValid,
    touchEmail,
    touchPassword,
    touchAll,
  } = useLoginValidation(email, password)

  const fillDemo = () => {
    const demo = DEMO_CREDENTIALS[role] || DEMO_CREDENTIALS.tourist
    setEmail(demo.email)
    setPassword(demo.password)
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    touchAll()
    setFormError('')

    if (!email.trim() || !password.trim()) {
      setFormError(t('login.requiredError'))
      return
    }
    if (!isEmailValid || !isPasswordValid) return

    setStatus('verifying')
    try {
      const loggedInUser = await login(email.trim(), password)
      navigate(`/dashboard/${loggedInUser.role}`)
    } catch (err) {
      setStatus('idle')
      setFormError(err.message || t('login.invalidCredentials'))
    }
  }

  const submitDisabled =
    status === 'verifying' ||
    !email.trim() ||
    !password.trim() ||
    Boolean(emailError) ||
    Boolean(passwordError)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-heading text-xl font-semibold text-primary">{t('common.appName')}</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="cursor-pointer rounded-md border border-border px-2 py-1 text-sm transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </div>

        <div
          className={`animate-scale-in rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-elevation-md)] ${formError ? 'animate-shake' : ''}`}
        >
          <h1 className="font-heading text-xl font-semibold text-foreground">{t('login.title')}</h1>
          <p className="mt-1 text-sm text-foreground/60">
            {t('login.type')}: {t(`login.roles.${role}`) || role}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
            <div>
              <div className="relative">
                <input
                  type="email"
                  placeholder={t('login.email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={touchEmail}
                  className={inputClasses(Boolean(emailError))}
                />
                {touched(email) && isEmailValid && !emailError && (
                  <CheckCircleSolid className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-success" />
                )}
              </div>
              {emailError && <p className="mt-1 text-xs text-destructive">{t(`login.${emailError}`)}</p>}
            </div>

            <div>
              <div className="relative">
                <input
                  type="password"
                  placeholder={t('login.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={touchPassword}
                  className={inputClasses(Boolean(passwordError))}
                />
                {password && isPasswordValid && !passwordError && (
                  <CheckCircleSolid className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-success" />
                )}
              </div>
              {passwordError && <p className="mt-1 text-xs text-destructive">{t(`login.${passwordError}`)}</p>}
            </div>

            {formError && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">{formError}</p>
            )}

            <button
              type="submit"
              disabled={submitDisabled}
              className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
            >
              {status === 'verifying' ? t('login.verifying') : t('login.submit')}
            </button>
          </form>

          <button
            type="button"
            onClick={fillDemo}
            className="mt-3 cursor-pointer text-xs font-medium text-foreground/50 underline decoration-dotted underline-offset-2 transition-colors duration-200 hover:text-primary"
          >
            {t('login.demoLink')}
          </button>
        </div>

        <Link
          to="/"
          className="mt-4 flex cursor-pointer items-center justify-center gap-1.5 text-sm font-medium text-foreground/60 transition-colors duration-200 hover:text-primary"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </div>
    </div>
  )
}

function touched(value) {
  return Boolean(value.trim())
}

export default Login
