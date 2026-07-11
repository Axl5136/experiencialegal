import { CalendarDaysIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../hooks/useLanguage'

function complianceStatus(permisos = []) {
  const now = new Date()
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  let status = 'green'
  for (const permiso of permisos) {
    const vencimiento = new Date(permiso.vencimiento)
    if (vencimiento < now) return 'red'
    if (vencimiento < in30Days) status = 'yellow'
  }
  return status
}

const STATUS_STYLES = {
  green: { dot: 'bg-success', text: 'text-success' },
  yellow: { dot: 'bg-warning', text: 'text-warning' },
  red: { dot: 'bg-destructive', text: 'text-destructive' },
}

function SidebarHotelier({ profile }) {
  const { t } = useLanguage()
  const permisos = profile?.permisos_vigentes ?? []
  const statusKey = complianceStatus(permisos)
  const status = STATUS_STYLES[statusKey]

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto rounded-xl border border-border bg-white p-5 shadow-[var(--shadow-elevation-md)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t('login.roles.hotelier')}</p>
        <h2 className="mt-1 font-heading text-lg font-semibold text-foreground">
          {profile?.establecimiento?.nombre}
        </h2>
        <p className="mt-1 text-sm text-foreground/60">{profile?.establecimiento?.direccion}</p>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
        <span className={`h-2.5 w-2.5 animate-pulse-soft rounded-full ${status.dot}`} />
        <span className={`text-sm font-medium ${status.text}`}>{t(`sidebarHotelier.compliance.${statusKey}`)}</span>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">{t('sidebarHotelier.permitsTitle')}</h3>
        <ul className="mt-2 space-y-2">
          {permisos.map((permiso) => (
            <li key={permiso.nombre} className="flex items-center justify-between text-sm">
              <span className="text-foreground/70">{permiso.nombre}</span>
              <span className="text-foreground/50">{permiso.vencimiento}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
      >
        <CalendarDaysIcon className="h-4 w-4" />
        {t('sidebarHotelier.scheduleAdvice')}
      </button>
      <button
        type="button"
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary"
      >
        <DocumentArrowDownIcon className="h-4 w-4" />
        {t('sidebarHotelier.downloadChecklist')}
      </button>
    </div>
  )
}

export default SidebarHotelier
