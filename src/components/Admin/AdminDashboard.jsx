import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import { getExpedientes } from '../../utils/storage'

function AdminDashboard() {
  const [search, setSearch] = useState('')
  const expedientes = getExpedientes()

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return expedientes
    return expedientes.filter(
      (exp) => exp.cliente.toLowerCase().includes(term) || exp.tipo_caso.toLowerCase().includes(term),
    )
  }, [expedientes, search])

  const clientesUnicos = new Set(expedientes.map((exp) => exp.cliente)).size

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Dashboard Expedientes</h1>

        <div className="mt-4 flex flex-wrap gap-4">
          {[
            { label: 'Expedientes Activos', value: expedientes.length },
            { label: 'Clientes', value: clientesUnicos },
            { label: 'Consultas esta semana', value: 12 },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="min-w-[160px] flex-1 rounded-xl border border-border bg-white p-4 shadow-[var(--shadow-elevation-sm)]"
            >
              <p className="font-heading text-2xl font-semibold text-primary">{kpi.value}</p>
              <p className="text-sm text-foreground/60">{kpi.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/admin/expediente/nuevo"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity duration-200 hover:opacity-90"
          >
            <PlusIcon className="h-4 w-4" />
            Crear nuevo expediente
          </Link>
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o tipo…"
              className="rounded-lg border border-border py-2.5 pl-9 pr-4 text-sm transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-white shadow-[var(--shadow-elevation-sm)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-foreground/50">
              <tr>
                <th className="px-4 py-3">Expediente</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Audiencia</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp) => (
                <tr key={exp.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{exp.id}</td>
                  <td className="px-4 py-3 text-foreground/70">{exp.cliente}</td>
                  <td className="px-4 py-3 text-foreground/70">{exp.tipo_caso}</td>
                  <td className="px-4 py-3 text-foreground/70">{exp.estado}</td>
                  <td className="px-4 py-3 text-foreground/70">
                    {new Date(exp.proxima_audiencia).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/expediente/${exp.id}`}
                      className="cursor-pointer font-medium text-primary hover:underline"
                    >
                      Ver detalles
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-foreground/50">
                    Sin resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AdminDashboard
