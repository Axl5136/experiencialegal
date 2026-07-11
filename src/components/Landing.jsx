import { Link } from 'react-router-dom'
import {
  UserIcon,
  BuildingOffice2Icon,
  ScaleIcon,
  ShieldCheckIcon,
  ClockIcon,
  AcademicCapIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

const ROLES = [
  {
    role: 'tourist',
    Icon: UserIcon,
    titulo: 'Turista',
    descripcion: 'Desconoces las leyes locales de CDMX y quieres viajar con tranquilidad.',
  },
  {
    role: 'hotelier',
    Icon: BuildingOffice2Icon,
    titulo: 'Hotelero',
    descripcion: 'Necesitas resolver la complejidad burocrática de tu establecimiento.',
  },
  {
    role: 'private_client',
    Icon: ScaleIcon,
    titulo: 'Cliente',
    descripcion: 'Tienes un caso abierto con nosotros y quieres seguir su avance.',
  },
]

const TRUST_BADGES = [
  { Icon: AcademicCapIcon, label: 'Abogados certificados' },
  { Icon: ClockIcon, label: 'Disponible 24/7' },
  { Icon: ShieldCheckIcon, label: 'Confidencialidad garantizada' },
]

function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-heading text-2xl font-semibold text-primary">
            Experiencia Legal
          </span>
          <a
            href="#contacto"
            className="cursor-pointer text-sm font-medium text-foreground/70 transition-colors duration-200 hover:text-primary"
          >
            Contacto
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-20 text-center">
          <span className="rounded-full bg-muted px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Despacho de Abogados · CDMX
          </span>
          <h1 className="mt-6 font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Asesoría Legal 24/7
          </h1>
          <p className="mt-4 max-w-xl text-lg text-foreground/70">
            Reducimos la fricción legal con inteligencia artificial, respaldada por abogados
            reales.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {TRUST_BADGES.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-foreground/70">
                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {ROLES.map(({ role, Icon, titulo, descripcion }) => (
              <div
                key={role}
                className="group flex flex-col items-start rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-elevation-md)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevation-lg)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  {titulo}
                </h2>
                <p className="mt-2 text-sm text-foreground/60">{descripcion}</p>
                <Link
                  to={`/login?role=${role}`}
                  className="mt-6 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-accent transition-colors duration-200 hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                >
                  Acceder
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer id="contacto" className="border-t border-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-8 text-center text-sm text-foreground/60">
          <p>Sobre nosotros · Blog · Contacto</p>
          <p>© 2024 Experiencia Legal. Despacho de Abogados, Ciudad de México.</p>
          <p className="text-xs text-foreground/40">
            La información proporcionada por el asistente es orientativa y no constituye
            asesoría legal formal.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
