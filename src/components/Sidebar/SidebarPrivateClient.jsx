import { PhoneIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../hooks/useLanguage'

const PROGRESS_BY_STATE = {
  'En investigación': 33,
  'En juicio': 66,
  Sentencia: 100,
}

function SidebarPrivateClient({ profile }) {
  const { t, language } = useLanguage()
  const expediente = profile?.expediente
  const progress = PROGRESS_BY_STATE[expediente?.estado] ?? 10
  const timeline = (expediente?.cronologia ?? [])
    .filter((c) => c.visible_cliente)
    .slice(-3)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto rounded-xl border border-border bg-white p-5 shadow-[var(--shadow-elevation-md)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t('login.roles.private_client')}</p>
        <h2 className="mt-1 font-heading text-lg font-semibold text-foreground">{expediente?.id}</h2>
        <p className="mt-1 text-sm text-foreground/60">
          {expediente?.tipo_caso} · {expediente?.estado}
        </p>
      </div>

      <div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-foreground/50">
          {progress}% {t('sidebarClient.progress')}
        </p>
      </div>

      <div className="rounded-lg bg-muted p-4">
        <h3 className="text-sm font-semibold text-foreground">{t('sidebarClient.nextHearing')}</h3>
        <p className="mt-1 text-sm text-foreground/70">
          {expediente?.proxima_audiencia
            ? new Date(expediente.proxima_audiencia).toLocaleDateString(language === 'en' ? 'en-US' : 'es-MX')
            : '—'}
        </p>
        <p className="text-xs text-foreground/50">{expediente?.lugar_audiencia}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">{t('sidebarClient.updates')}</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-foreground/70">
          {timeline.map((item) => (
            <li key={item.id}>
              <span className="text-foreground/50">{item.fecha}:</span> {item.titulo}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-foreground/50">
        {t('sidebarClient.assignedLawyer')}: {expediente?.abogado_asignado}
      </p>

      <button
        type="button"
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity duration-200 hover:opacity-90"
      >
        <PhoneIcon className="h-4 w-4" />
        {t('sidebarClient.contactLawyer')}
      </button>
      <button
        type="button"
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary"
      >
        <DocumentArrowDownIcon className="h-4 w-4" />
        {t('sidebarClient.downloadDocuments')}
      </button>
    </div>
  )
}

export default SidebarPrivateClient
