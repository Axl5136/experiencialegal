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
import { useLanguage } from '../hooks/useLanguage'

const ROLES = [
  { role: 'tourist', Icon: UserIcon, key: 'tourist' },
  { role: 'hotelier', Icon: BuildingOffice2Icon, key: 'hotelier' },
  { role: 'private_client', Icon: ScaleIcon, key: 'private_client' },
]

function Landing() {
  const { t, language, setLanguage } = useLanguage()

  const TRUST_BADGES = [
    { Icon: AcademicCapIcon, label: t('landing.trust.certified') },
    { Icon: ClockIcon, label: t('landing.trust.available') },
    { Icon: ShieldCheckIcon, label: t('landing.trust.confidential') },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="hero-gradient">
        <header className="sticky top-0 z-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <span className="font-heading text-2xl font-semibold text-white">{t('common.appName')}</span>
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="cursor-pointer rounded-md border border-white/30 bg-white/10 px-2 py-1 text-sm text-white transition-colors duration-200 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option className="text-foreground" value="es">ES</option>
                <option className="text-foreground" value="en">EN</option>
              </select>
              <a
                href="#contacto"
                className="cursor-pointer text-sm font-medium text-white/80 transition-colors duration-200 hover:text-white"
              >
                {t('common.contact')}
              </a>
            </div>
          </div>
        </header>

        <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-28 pt-8 text-center">
          <span className="animate-fade-in-up rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white ring-1 ring-inset ring-white/25">
            {t('landing.badge')}
          </span>
          <h1
            className="animate-fade-in-up mt-6 font-heading text-4xl leading-tight text-white sm:text-5xl"
            style={{ animationDelay: '80ms' }}
          >
            {t('landing.title')}
          </h1>
          <p
            className="animate-fade-in-up mt-4 max-w-xl text-lg text-white/80"
            style={{ animationDelay: '160ms' }}
          >
            {t('landing.subtitle')}
          </p>

          <div
            className="animate-fade-in-up mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
            style={{ animationDelay: '240ms' }}
          >
            {TRUST_BADGES.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-white/80">
                <Icon className="h-5 w-5 text-primary-light" aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 -mt-16 pb-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {ROLES.map(({ role, Icon, key }, index) => (
              <div
                key={role}
                className="group animate-fade-in-up flex flex-col items-start rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-elevation-lg)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-elevation-xl)] active:scale-[0.99]"
                style={{ animationDelay: `${320 + index * 100}ms` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted transition-transform duration-200 group-hover:scale-110">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  {t(`landing.roles.${key}.title`)}
                </h2>
                <p className="mt-2 text-sm text-foreground/60">{t(`landing.roles.${key}.description`)}</p>
                <Link
                  to={`/login?role=${role}`}
                  className="mt-6 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-accent transition-colors duration-200 hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                >
                  {t('landing.access')}
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer id="contacto" className="border-t border-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-8 text-center text-sm text-foreground/60">
          <p>{t('landing.footerLinks')}</p>
          <p>© 2024 {t('common.appName')}. Ciudad de México.</p>
          <p className="text-xs text-foreground/40">{t('common.disclaimer')}</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
