import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon, LinkIcon, PlusIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import { getExpedienteById, updateExpediente, addCronologiaEvento } from '../../utils/storage'

function ExpedienteDetail() {
  const { id } = useParams()
  const [expediente, setExpediente] = useState(() => getExpedienteById(id))
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(expediente ?? {})
  const [showLink, setShowLink] = useState(false)
  const [copied, setCopied] = useState(false)
  const [newEvento, setNewEvento] = useState({ fecha: '', titulo: '' })

  if (!expediente) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto flex-1 px-6 py-8 text-center text-foreground/60">
          Expediente no encontrado.
          <div className="mt-4">
            <Link to="/admin/dashboard" className="text-primary hover:underline">
              Volver al dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const clientLink = `${window.location.origin}/cliente/${expediente.hash_cliente}`

  const saveEdits = () => {
    const updated = updateExpediente(expediente.id, draft)
    setExpediente(updated)
    setEditing(false)
  }

  const addEvento = () => {
    if (!newEvento.fecha || !newEvento.titulo) return
    const updated = addCronologiaEvento(expediente.id, { ...newEvento, tipo: 'Evento' })
    setExpediente(updated)
    setNewEvento({ fecha: '', titulo: '' })
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(clientLink)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const field = (label, key, type = 'text') => (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground/70">{label}</label>
      {editing ? (
        <input
          type={type}
          value={draft[key] ?? ''}
          onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      ) : (
        <p className="text-sm text-foreground">{expediente[key] || '—'}</p>
      )}
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <Link
          to="/admin/dashboard"
          className="flex cursor-pointer items-center gap-1.5 text-sm text-foreground/60 hover:text-primary"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver al dashboard
        </Link>

        <div className="mt-4 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold text-foreground">{expediente.id}</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowLink(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary"
            >
              <LinkIcon className="h-4 w-4" />
              Generar link cliente
            </button>
            {editing ? (
              <button
                type="button"
                onClick={saveEdits}
                className="cursor-pointer rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              >
                Guardar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDraft(expediente)
                  setEditing(true)
                }}
                className="cursor-pointer rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              >
                Editar
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-elevation-sm)] sm:grid-cols-2">
          {field('Cliente', 'cliente')}
          {field('Tipo de caso', 'tipo_caso')}
          {field('Estado', 'estado')}
          {field('Abogado', 'abogado')}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-elevation-sm)]">
          <h2 className="font-heading text-lg font-semibold text-foreground">Cronología</h2>
          <ul className="mt-3 space-y-2 border-l border-border pl-4">
            {(expediente.cronologia ?? []).map((evento) => (
              <li key={evento.id} className="text-sm">
                <span className="font-medium text-foreground">{evento.fecha}</span>{' '}
                <span className="text-foreground/70">— {evento.titulo}</span>
              </li>
            ))}
            {(expediente.cronologia ?? []).length === 0 && (
              <li className="text-sm text-foreground/50">Sin eventos registrados.</li>
            )}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2">
            <input
              type="date"
              value={newEvento.fecha}
              onChange={(e) => setNewEvento((prev) => ({ ...prev, fecha: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Descripción del evento"
              value={newEvento.titulo}
              onChange={(e) => setNewEvento((prev) => ({ ...prev, titulo: e.target.value }))}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={addEvento}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4" />
              Agregar evento
            </button>
          </div>
        </div>
      </main>

      {showLink && (
        <div className="animate-fade-in fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
          <div className="animate-scale-in w-full max-w-md rounded-2xl bg-white p-8 shadow-[var(--shadow-elevation-xl)]">
            <h3 className="font-heading text-lg font-semibold text-foreground">Link de acceso para el cliente</h3>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <span className="flex-1 truncate text-sm text-foreground/70">{clientLink}</span>
              <button
                type="button"
                onClick={copyLink}
                className="flex cursor-pointer items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-95"
              >
                <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowLink(false)}
              className="mt-5 w-full cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary active:scale-[0.99]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default ExpedienteDetail
