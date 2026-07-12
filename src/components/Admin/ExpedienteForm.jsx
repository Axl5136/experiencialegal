import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeftIcon, MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import { useToast } from '../../hooks/useToast'
import * as expedientesService from '../../services/expedientesService'
import * as usersService from '../../services/usersService'

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

  const [clienteQuery, setClienteQuery] = useState('')
  const [clienteResults, setClienteResults] = useState([])
  const [searchingCliente, setSearchingCliente] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const searchBoxRef = useRef(null)

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  useEffect(() => {
    if (selectedCliente || clienteQuery.trim().length < 2) {
      return
    }
    const timeout = window.setTimeout(() => {
      setSearchingCliente(true)
      usersService
        .searchClientes(clienteQuery.trim())
        .then((results) => setClienteResults(results))
        .catch(() => setClienteResults([]))
        .finally(() => setSearchingCliente(false))
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [clienteQuery, selectedCliente])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectCliente = (cliente) => {
    setSelectedCliente(cliente)
    setForm((prev) => ({ ...prev, cliente_id: cliente.id }))
    setClienteQuery(`${cliente.nombre} (${cliente.email})`)
    setShowDropdown(false)
  }

  const clearCliente = () => {
    setSelectedCliente(null)
    setForm((prev) => ({ ...prev, cliente_id: '' }))
    setClienteQuery('')
    setClienteResults([])
  }

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
          <div ref={searchBoxRef} className="relative">
            <label className="mb-1 block text-sm font-medium text-foreground/70">Cliente</label>
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input
                required
                placeholder="Busca por nombre o email…"
                value={clienteQuery}
                onChange={(e) => {
                  setClienteQuery(e.target.value)
                  setSelectedCliente(null)
                  setForm((prev) => ({ ...prev, cliente_id: '' }))
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                className={`${inputClasses} pl-9 ${selectedCliente ? 'pr-9' : ''}`}
              />
              {selectedCliente && (
                <button
                  type="button"
                  onClick={clearCliente}
                  aria-label="Quitar cliente seleccionado"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-foreground/40 hover:text-foreground/70"
                >
                  <XCircleIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {selectedCliente && (
              <p className="mt-1 flex items-center gap-1 text-xs text-success">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                Cliente seleccionado: {selectedCliente.nombre}
              </p>
            )}

            {showDropdown && !selectedCliente && clienteQuery.trim().length >= 2 && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-white shadow-[var(--shadow-elevation-md)]">
                {searchingCliente && (
                  <p className="px-4 py-3 text-sm text-foreground/50">Buscando…</p>
                )}
                {!searchingCliente && clienteResults.length === 0 && (
                  <p className="px-4 py-3 text-sm text-foreground/50">Sin coincidencias.</p>
                )}
                {!searchingCliente &&
                  clienteResults.map((cliente) => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => selectCliente(cliente)}
                      className="flex w-full cursor-pointer flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-muted"
                    >
                      <span className="font-medium text-foreground">{cliente.nombre}</span>
                      <span className="text-xs text-foreground/50">{cliente.email}</span>
                    </button>
                  ))}
              </div>
            )}
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
            disabled={saving || !form.cliente_id}
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
