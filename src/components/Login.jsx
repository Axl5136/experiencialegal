import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-800">Experiencia Legal</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">Inicia sesión</h1>
          <p className="mt-1 text-sm text-slate-500">Tipo: {ROLE_LABELS[role] || role}</p>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="mt-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Iniciar sesión
            </button>
          </form>

          <button
            type="button"
            onClick={fillDemo}
            className="mt-3 text-xs text-slate-500 underline hover:text-slate-700"
          >
            Usar credenciales de demo
          </button>
        </div>

        <Link to="/" className="mt-4 block text-center text-sm text-slate-500 hover:text-slate-700">
          ← Volver
        </Link>
      </div>
    </div>
  )
}

export default Login
