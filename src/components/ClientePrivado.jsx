import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { getExpedienteByHash } from '../utils/storage'
import { LegalAgentProvider } from '../context/LegalAgentContext'
import Footer from './Common/Footer'
import ChatBox from './Chat/ChatBox'
import SidebarPrivateClient from './Sidebar/SidebarPrivateClient'
import Placeholder from './Common/Placeholder'

function ClientePrivado() {
  const { hash } = useParams()
  const { language, setLanguage, t } = useLanguage()
  const expediente = useMemo(() => getExpedienteByHash(hash), [hash])

  if (!expediente) {
    return <Placeholder title="Link inválido o expediente no encontrado" />
  }

  const profile = { role: 'private_client', nombre: expediente.cliente, expediente }

  return (
    <LegalAgentProvider profile={profile} language={language}>
      <div className="flex h-screen flex-col bg-background">
        <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
          <span className="font-heading text-lg font-semibold text-primary">{t('common.appName')}</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-foreground/70 sm:inline">
              {t('common.hello')}, {expediente.cliente}
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
          <section className="min-h-[50vh] flex-[2] md:min-h-0">
            <ChatBox />
          </section>
          <aside className="flex-1 md:max-w-sm">
            <SidebarPrivateClient profile={profile} />
          </aside>
        </main>

        <Footer />
      </div>
    </LegalAgentProvider>
  )
}

export default ClientePrivado
