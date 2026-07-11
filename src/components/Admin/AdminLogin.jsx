import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'
import usersData from '../../data/users.json'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const fillDemo = () => {
    setEmail('maria@experiencialegal.com')
    setPassword('demo123')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Completa email y contraseña.')
      return
    }

    const matched = usersData.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.role === 'lawyer',
    )

    const user = matched
      ? { id: matched.id, email: matched.email, role: matched.role, nombre: matched.nombre }
      : { id: 'DEMO-LAWYER', email: email.trim(), role: 'lawyer', nombre: email.split('@')[0] }

    login(user)
    navigate('/admin/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <span className="font-heading text-xl font-semibold text-primary">Experiencia Legal</span>
          <p className="text-sm text-foreground/50">Panel de abogados</p>
        </div>

        <div className={`animate-scale-in rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-elevation-md)] ${error ? 'animate-shake' : ''}`}>
          <h1 className="font-heading text-xl font-semibold text-foreground">Acceso Admin</h1>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border px-4 py-3 text-sm placeholder:text-foreground/40 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-border px-4 py-3 text-sm placeholder:text-foreground/40 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              className="mt-1 cursor-pointer rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

export default AdminLogin
