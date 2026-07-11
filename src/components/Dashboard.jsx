import { useParams } from 'react-router-dom'
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'

function Dashboard() {
  const { role } = useParams()
  const { user, logout } = useAuth()
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
        <span className="font-heading text-lg font-semibold text-primary">Experiencia Legal</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-foreground/70">Hola, {user?.nombre}</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="cursor-pointer rounded-md border border-border px-2 py-1 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
          <button
            onClick={logout}
            className="flex cursor-pointer items-center gap-1.5 text-foreground/60 transition-colors duration-200 hover:text-destructive"
          >
            <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Rol: {role}
          </p>
          <h1 className="mt-2 font-heading text-xl font-semibold text-foreground">
            Chat y sidebar llegan en la siguiente fase del build
          </h1>
        </div>
      </main>

      <footer className="border-t border-border bg-white px-6 py-4 text-center text-xs text-foreground/40">
        © 2024 Experiencia Legal. Esto no constituye asesoría legal formal.
      </footer>
    </div>
  )
}

export default Dashboard
