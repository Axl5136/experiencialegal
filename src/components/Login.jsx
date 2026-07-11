import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import usersData from '../data/users.json'

const DEMO_CREDENTIALS = {
  tourist: { email: 'turista@demo.com', password: 'demo123' },
  hotelier: { email: 'hotelero@demo.com', password: 'demo123' },
  private_client: { email: 'juan@demo.com', password: 'demo123' },
  lawyer: { email: 'maria@experiencialegal.com', password: 'demo123' },
}

const ROLE_LABELS = {
  tourist: 'Turista',
  hotelier: 'Hotelero',
  private_client: 'Cliente',
  lawyer: 'Abogado',
}

const inputClasses =
  'rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

function Login() {
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'tourist'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const { language, setLanguage } = useLanguage()
  const navigate = useNavigate()

  const fillDemo = () => {
    const demo = DEMO_CREDENTIALS[role] || DEMO_CREDENTIALS.tourist
    setEmail(demo.email)
    setPassword(demo.password)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Completa email y contraseña.')
      return
    }

    const matched = usersData.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.role === role,
    )

    const user = matched
      ? { id: matched.id, email: matched.email, role: matched.role, nombre: matched.nombre }
      : { id: `DEMO-${role.toUpperCase()}`, email: email.trim(), role, nombre: email.split('@')[0] }

    login(user)
    navigate(`/dashboard/${role}`)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-heading text-xl font-semibold text-primary">
            Experiencia Legal
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="cursor-pointer rounded-md border border-border px-2 py-1 text-sm transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-elevation-md)]">
          <h1 className="font-heading text-xl font-semibold text-foreground">Inicia sesión</h1>
          <p className="mt-1 text-sm text-foreground/60">Tipo: {ROLE_LABELS[role] || role}</p>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              className="mt-1 cursor-pointer rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Iniciar sesión
            </button>
          </form>

          <button
            type="button"
            onClick={fillDemo}
            className="mt-3 cursor-pointer text-xs font-medium text-foreground/50 underline decoration-dotted underline-offset-2 transition-colors duration-200 hover:text-primary"
          >
            Usar credenciales de demo
          </button>
        </div>

        <Link
          to="/"
          className="mt-4 flex cursor-pointer items-center justify-center gap-1.5 text-sm font-medium text-foreground/60 transition-colors duration-200 hover:text-primary"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver
        </Link>
      </div>
    </div>
  )
}

export default Login
