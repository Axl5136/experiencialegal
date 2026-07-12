import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import { useToast } from '../../hooks/useToast'
import * as expedientesService from '../../services/expedientesService'

const TIPOS = ['Laboral', 'Penal', 'Civil', 'Comercial']
const ESTADOS = ['En investigación', 'En juicio', 'Sentencia', 'Cerrado']

const inputClasses =
  'w-full rounded-lg border border-border px-4 py-2.5 text-sm transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

function ExpedienteForm() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    cliente_id: '',
    tipo_caso: TIPOS[0],
    estado: ESTADOS[0],
    fecha_inicio: '',
    proxima_audiencia: '',
    descripcion: '',
  })

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const expediente = await expedientesService.create(form)
      showToast('Expediente creado', 'success')
      navigate(`/admin/expediente/${expediente.id}`)
    } catch (err) {
      showToast(err.message || 'No se pudo crear el expediente', 'error')
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <Link
          to="/admin/dashboard"
          className="flex cursor-pointer items-center gap-1.5 text-sm text-foreground/60 hover:text-primary"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver al dashboard
        </Link>

        <h1 className="mt-4 font-heading text-2xl font-semibold text-foreground">Nuevo expediente</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-elevation-sm)]">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">ID de cliente (UUID)</label>
            <input
              required
              placeholder="ej. 163c5363-2af7-4e15-b02c-9eef98cbbbfb"
              value={form.cliente_id}
              onChange={update('cliente_id')}
              className={`${inputClasses} font-mono`}
            />
            <p className="mt-1 text-xs text-foreground/50">
              El backend aún no expone una búsqueda de clientes por nombre/email, así que por ahora se
              requiere el UUID real del cliente (visible al hacer login con esa cuenta).
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/70">Tipo de caso</label>
              <select value={form.tipo_caso} onChange={update('tipo_caso')} className={inputClasses}>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/70">Estado</label>
              <select value={form.estado} onChange={update('estado')} className={inputClasses}>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/70">Fecha inicio</label>
              <input type="date" value={form.fecha_inicio} onChange={update('fecha_inicio')} className={inputClasses} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/70">Próxima audiencia</label>
              <input
                type="datetime-local"
                value={form.proxima_audiencia}
                onChange={update('proxima_audiencia')}
                className={inputClasses}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Descripción</label>
            <textarea rows={3} value={form.descripcion} onChange={update('descripcion')} className={inputClasses} />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Guardando…' : 'Guardar expediente'}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  )
}

export default ExpedienteForm
