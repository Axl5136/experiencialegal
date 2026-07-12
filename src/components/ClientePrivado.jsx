import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { LegalAgentProvider } from '../context/LegalAgentContext'
import * as publicClienteService from '../services/publicClienteService'
import { TIPO_CASO_TO_LABEL, ESTADO_TO_LABEL } from '../services/expedientesService'
import Footer from './Common/Footer'
import ChatBox from './Chat/ChatBox'
import SidebarPrivateClient from './Sidebar/SidebarPrivateClient'
import Placeholder from './Common/Placeholder'

function adaptPublicExpediente(exp) {
  return {
    ...exp,
    tipo_caso: TIPO_CASO_TO_LABEL[exp.tipo_caso] ?? exp.tipo_caso,
    estado: ESTADO_TO_LABEL[exp.estado] ?? exp.estado,
    cronologia: (exp.cronologia ?? []).map((c) => ({
      id: c.id,
      fecha: c.fecha,
      tipo: c.tipo,
      titulo: c.evento,
      visible_cliente: c.visible_cliente,
    })),
  }
}

function ClientePrivado() {
  // Ruta pública validada por link_hash (sin login/JWT): backend expone
  // GET/POST /api/public/cliente/:hash específicamente para este flujo.
  const { hash } = useParams()
  const { language, setLanguage, t } = useLanguage()
  const [expediente, setExpediente] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    publicClienteService
      .getExpediente(hash)
      .then((exp) => {
        if (!cancelled) setExpediente(adaptPublicExpediente(exp))
      })
      .catch(() => {
        if (!cancelled) setExpediente(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [hash])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-foreground/50">
        Cargando…
      </div>
    )
  }

  if (!expediente) {
    return <Placeholder title="Link inválido o expediente no encontrado" />
  }

  const profile = { id: hash, role: 'private_client', nombre: `Expediente ${expediente.numero}`, expediente }

  return (
    <LegalAgentProvider profile={profile} language={language} publicHash={hash}>
      <div className="flex h-screen flex-col bg-background">
        <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
          <span className="font-heading text-lg font-semibold text-primary">{t('common.appName')}</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-foreground/70 sm:inline">
              {t('common.hello')}, {expediente.numero}
            </span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="cursor-pointer rounded-md border border-border px-2 py-1 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
            <Link to="/login" className="cursor-pointer text-foreground/60 transition-colors duration-200 hover:text-primary">
              {t('common.back')}
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:flex-row">
          <section className="animate-fade-in-up min-h-[50vh] flex-[2] md:min-h-0">
            <ChatBox
              role="private_client"
              userInitial={profile.nombre.charAt(0).toUpperCase()}
              onUploadFile={(file) => publicClienteService.uploadEvidencia(hash, file)}
            />
          </section>
          <aside className="animate-fade-in-up flex-1 md:max-w-sm" style={{ animationDelay: '100ms' }}>
            <SidebarPrivateClient profile={profile} />
          </aside>
        </main>

        <Footer />
      </div>
    </LegalAgentProvider>
  )
}

export default ClientePrivado
