import { Link } from 'react-router-dom'

const ROLES = [
  {
    role: 'tourist',
    emoji: '👤',
    titulo: 'Turista',
    descripcion: 'Desconoces las leyes locales de CDMX',
  },
  {
    role: 'hotelier',
    emoji: '🏨',
    titulo: 'Hotelero',
    descripcion: 'Complejidad burocrática de tu establecimiento',
  },
  {
    role: 'private_client',
    emoji: '⚖️',
    titulo: 'Cliente',
    descripcion: 'Saturación de consultas sobre tu caso',
  },
]

function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-bold text-slate-800">Experiencia Legal</span>
        <a href="#contacto" className="text-sm text-slate-600 hover:text-slate-900">
          Contacto
        </a>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 py-12 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Asesoría Legal 24/7
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Reducimos la fricción legal con IA
        </p>

        <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {ROLES.map(({ role, emoji, titulo, descripcion }) => (
            <div
              key={role}
              className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="text-3xl">{emoji}</span>
              <h2 className="mt-3 text-lg font-semibold text-slate-800">{titulo}</h2>
              <p className="mt-2 text-sm text-slate-500">{descripcion}</p>
              <Link
                to={`/login?role=${role}`}
                className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Acceder
              </Link>
            </div>
          ))}
        </div>
      </main>

      <footer id="contacto" className="border-t border-slate-200 px-6 py-6 text-center text-xs text-slate-500">
        <p>Sobre nosotros | Blog | Contacto</p>
        <p className="mt-1">© 2024 Experiencia Legal. Despacho de Abogados, CDMX.</p>
      </footer>
    </div>
  )
}

export default Landing
