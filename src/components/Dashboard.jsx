import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'

function Dashboard() {
  const { role } = useParams()
  const { user, logout } = useAuth()
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <span className="text-lg font-bold text-slate-800">Experiencia Legal</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-600">Hola, {user?.nombre}</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
          <button onClick={logout} className="text-slate-500 hover:text-slate-800">
            Logout
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12 text-center">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Rol: {role}</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-800">
            Chat y sidebar llegan en la siguiente fase del build
          </h1>
        </div>
      </main>

      <footer className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400">
        © 2024 Experiencia Legal. Esto no constituye asesoría legal formal.
      </footer>
    </div>
  )
}

export default Dashboard
