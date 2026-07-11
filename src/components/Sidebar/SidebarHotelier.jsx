import { useState } from 'react'
import { CalendarDaysIcon, DocumentArrowDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../hooks/useLanguage'
import { useToast } from '../../hooks/useToast'
import Modal from '../Common/Modal'

const CHECKLIST = [
  { nombre: 'Licencia de Funcionamiento', descripcion: 'Autorización para operar tu negocio ante la Alcaldía.' },
  { nombre: 'Licencia Sanitaria (NOM-251)', descripcion: 'Requerida para manipulación de alimentos ante la Secretaría de Salud.' },
  { nombre: 'Protección Civil', descripcion: 'Plan de evacuación, extintores y señalización vigentes.' },
  { nombre: 'Uso de Suelo', descripcion: 'Constancia de que el giro comercial es compatible con la zona.' },
  { nombre: 'Aviso de Funcionamiento (SAT)', descripcion: 'Registro fiscal del establecimiento.' },
]

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

const inputClasses =
  'w-full rounded-lg border-2 border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 transition-colors duration-200 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20'

function SidebarHotelier({ profile }) {
  const { t } = useLanguage()
  const { showToast } = useToast()
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [checklistOpen, setChecklistOpen] = useState(false)
  const [form, setForm] = useState({
    nombre: profile?.nombre ?? '',
    telefono: profile?.establecimiento?.telefono ?? '',
    email: profile?.email ?? '',
    fecha: '',
    hora: '',
    mensaje: '',
  })

  const permisos = profile?.permisos_vigentes ?? []
  const statusKey = complianceStatus(permisos)
  const status = STATUS_STYLES[statusKey]

  const updateForm = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSchedule = (e) => {
    e.preventDefault()
    setScheduleOpen(false)
    showToast('Asesoría agendada correctamente. Te contactaremos pronto.', 'success')
  }

  const handleDownload = () => {
    setChecklistOpen(false)
    showToast('Descargando checklist-permisos.pdf…', 'info')
  }

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
        onClick={() => setScheduleOpen(true)}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
      >
        <CalendarDaysIcon className="h-4 w-4" />
        {t('sidebarHotelier.scheduleAdvice')}
      </button>
      <button
        type="button"
        onClick={() => setChecklistOpen(true)}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary"
      >
        <DocumentArrowDownIcon className="h-4 w-4" />
        {t('sidebarHotelier.downloadChecklist')}
      </button>

      <Modal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Agendar Asesoría"
        footer={
          <>
            <button
              type="button"
              onClick={() => setScheduleOpen(false)}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-foreground/60 transition-colors duration-200 hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="schedule-form"
              className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            >
              Agendar
            </button>
          </>
        }
      >
        <form id="schedule-form" onSubmit={handleSchedule} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/60">Nombre</label>
            <input value={form.nombre} onChange={updateForm('nombre')} className={inputClasses} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/60">Teléfono</label>
            <input value={form.telefono} onChange={updateForm('telefono')} className={inputClasses} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/60">Email</label>
            <input type="email" value={form.email} onChange={updateForm('email')} className={inputClasses} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/60">Fecha</label>
              <input type="date" value={form.fecha} onChange={updateForm('fecha')} className={inputClasses} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/60">Hora</label>
              <input type="time" value={form.hora} onChange={updateForm('hora')} className={inputClasses} required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/60">Mensaje</label>
            <textarea rows={3} value={form.mensaje} onChange={updateForm('mensaje')} className={inputClasses} />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={checklistOpen}
        onClose={() => setChecklistOpen(false)}
        title="Checklist de Permisos"
        footer={
          <>
            <button
              type="button"
              onClick={() => setChecklistOpen(false)}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-foreground/60 transition-colors duration-200 hover:text-foreground"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Descargar PDF
            </button>
          </>
        }
      >
        <ul className="space-y-3">
          {CHECKLIST.map((item, i) => (
            <li key={item.nombre} className="flex gap-3 text-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-foreground">{item.nombre}</p>
                <p className="text-foreground/60">{item.descripcion}</p>
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  )
}

export default SidebarHotelier
