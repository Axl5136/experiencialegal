import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon, LinkIcon, PlusIcon, ClipboardDocumentIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import Modal from '../Common/Modal'
import { useToast } from '../../hooks/useToast'
import * as expedientesService from '../../services/expedientesService'
import * as documentosService from '../../services/documentosService'

const TIPOS = ['Laboral', 'Penal', 'Civil', 'Comercial']
const ESTADOS = ['En investigación', 'En juicio', 'Sentencia', 'Cerrado']

const PROCESSING_STATUS_LABEL = {
  pending: 'Pendiente',
  processing: 'Procesando…',
  completed: 'Completado',
  failed: 'Falló',
}

const PROCESSING_STATUS_CLASS = {
  pending: 'bg-muted text-foreground/60',
  processing: 'bg-warning/15 text-warning',
  completed: 'bg-success/15 text-success',
  failed: 'bg-destructive/15 text-destructive',
}

function ExpedienteDetail() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [expediente, setExpediente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({})
  const [showLink, setShowLink] = useState(false)
  const [newEvento, setNewEvento] = useState({ fecha: '', titulo: '' })
  const [fileToUpload, setFileToUpload] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deletingDocId, setDeletingDocId] = useState(null)

  useEffect(() => {
    let cancelled = false
    expedientesService
      .getById(id)
      .then((exp) => {
        if (cancelled) return
        setExpediente(exp)
        setDraft(exp)
      })
      .catch((err) => {
        if (!cancelled) showToast(err.message || 'No se pudo cargar el expediente', 'error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, showToast])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto flex-1 px-6 py-8 text-center text-foreground/50">Cargando expediente…</main>
        <Footer />
      </div>
    )
  }

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

  const saveEdits = async () => {
    setSaving(true)
    try {
      const updated = await expedientesService.update(expediente.id, draft)
      setExpediente(updated)
      setDraft(updated)
      setEditing(false)
      showToast('Expediente actualizado', 'success')
    } catch (err) {
      showToast(err.message || 'No se pudo guardar el expediente', 'error')
    } finally {
      setSaving(false)
    }
  }

  const addEvento = () => {
    showToast('El backend aún no expone un endpoint para agregar eventos de cronología', 'info')
  }

  const handleUpload = async () => {
    if (!fileToUpload) return
    setUploading(true)
    try {
      const doc = await documentosService.uploadAbogado(expediente.id, fileToUpload)
      setExpediente((prev) => ({ ...prev, documentos: [doc, ...(prev.documentos ?? [])] }))
      setFileToUpload(null)
      showToast(`Archivo subido: ${doc.filename}`, 'success')
    } catch (err) {
      showToast(err.message || 'No se pudo subir el documento', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDoc = async (docId) => {
    setDeletingDocId(docId)
    try {
      await documentosService.remove(docId)
      setExpediente((prev) => ({ ...prev, documentos: (prev.documentos ?? []).filter((d) => d.id !== docId) }))
      showToast('Documento eliminado', 'success')
    } catch (err) {
      showToast(err.message || 'No se pudo eliminar el documento', 'error')
    } finally {
      setDeletingDocId(null)
    }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(clientLink)
    showToast('Link copiado al portapapeles', 'success')
  }

  const field = (label, key, options) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground/70">{label}</label>
      {editing ? (
        options ? (
          <select
            value={draft[key] ?? ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={draft[key] ?? ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        )
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
          <h1 className="font-mono text-2xl font-semibold text-foreground">{expediente.numero}</h1>
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
                disabled={saving}
                className="cursor-pointer rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? 'Guardando…' : 'Guardar'}
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
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Cliente (ID)</label>
            <p className="font-mono text-sm text-foreground" title={expediente.cliente}>
              {expediente.cliente}
            </p>
          </div>
          {field('Tipo de caso', 'tipo_caso', TIPOS)}
          {field('Estado', 'estado', ESTADOS)}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Abogado (ID)</label>
            <p className="font-mono text-sm text-foreground" title={expediente.abogado}>
              {expediente.abogado}
            </p>
          </div>
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

        <div className="mt-6 rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-elevation-sm)]">
          <h2 className="font-heading text-lg font-semibold text-foreground">Documentos</h2>
          <ul className="mt-3 space-y-2">
            {(expediente.documentos ?? []).map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{doc.filename}</p>
                  <p className="text-xs text-foreground/50">{doc.uploaded_by_role === 'cliente' ? 'Subido por cliente' : 'Subido por abogado'}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${PROCESSING_STATUS_CLASS[doc.processing_status] ?? PROCESSING_STATUS_CLASS.pending}`}
                  >
                    {PROCESSING_STATUS_LABEL[doc.processing_status] ?? doc.processing_status}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteDoc(doc.id)}
                    disabled={deletingDocId === doc.id}
                    aria-label="Eliminar documento"
                    className="cursor-pointer text-foreground/40 transition-colors duration-150 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
            {(expediente.documentos ?? []).length === 0 && (
              <li className="text-sm text-foreground/50">Sin documentos.</li>
            )}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              type="file"
              onChange={(e) => setFileToUpload(e.target.files?.[0] ?? null)}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:font-medium"
            />
            <button
              type="button"
              onClick={handleUpload}
              disabled={!fileToUpload || uploading}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              {uploading ? 'Subiendo…' : 'Subir documento'}
            </button>
          </div>
        </div>
      </main>

      <Modal
        isOpen={showLink}
        onClose={() => setShowLink(false)}
        title="Link de acceso para el cliente"
        footer={
          <button
            type="button"
            onClick={() => setShowLink(false)}
            className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary active:scale-[0.99]"
          >
            Cerrar
          </button>
        }
      >
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
          <span className="flex-1 truncate font-mono text-sm text-foreground/70">{clientLink}</span>
          <button
            type="button"
            onClick={copyLink}
            className="flex cursor-pointer items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-95"
          >
            <ClipboardDocumentIcon className="h-3.5 w-3.5" />
            Copiar Link
          </button>
        </div>
      </Modal>

      <Footer />
    </div>
  )
}

export default ExpedienteDetail
