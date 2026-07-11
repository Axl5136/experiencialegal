import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import { createExpediente } from '../../utils/storage'

const TIPOS = ['Laboral', 'Penal', 'Civil', 'Comercial']
const ESTADOS = ['En investigación', 'En juicio', 'Sentencia', 'Cerrado']

const inputClasses =
  'w-full rounded-lg border border-border px-4 py-2.5 text-sm transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

function ExpedienteForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    cliente: '',
    email_cliente: '',
    tipo_caso: TIPOS[0],
    estado: ESTADOS[0],
    fecha_inicio: '',
    proxima_audiencia: '',
    abogado: '',
    descripcion: '',
  })

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const expediente = createExpediente({
      ...form,
      proxima_audiencia: form.proxima_audiencia ? new Date(form.proxima_audiencia).toISOString() : null,
    })
    navigate(`/admin/expediente/${expediente.id}`)
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
            <label className="mb-1 block text-sm font-medium text-foreground/70">Nombre cliente</label>
            <input required value={form.cliente} onChange={update('cliente')} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Email cliente</label>
            <input
              required
              type="email"
              value={form.email_cliente}
              onChange={update('email_cliente')}
              className={inputClasses}
            />
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
            <label className="mb-1 block text-sm font-medium text-foreground/70">Abogado asignado</label>
            <input value={form.abogado} onChange={update('abogado')} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Descripción</label>
            <textarea rows={3} value={form.descripcion} onChange={update('descripcion')} className={inputClasses} />
          </div>

          <button
            type="submit"
            className="mt-2 cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          >
            Guardar expediente
          </button>
        </form>
      </main>

      <Footer />
    </div>
  )
}

export default ExpedienteForm
