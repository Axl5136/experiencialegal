import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { getUserProfile } from '../utils/getUserProfile'
import { LegalAgentProvider } from '../context/LegalAgentContext'
import * as expedientesService from '../services/expedientesService'
import Header from './Common/Header'
import Footer from './Common/Footer'
import ChatBox from './Chat/ChatBox'
import SidebarTourist from './Sidebar/SidebarTourist'
import SidebarHotelier from './Sidebar/SidebarHotelier'
import SidebarPrivateClient from './Sidebar/SidebarPrivateClient'

const SIDEBARS = {
  tourist: SidebarTourist,
  hotelier: SidebarHotelier,
  private_client: SidebarPrivateClient,
}

function Dashboard() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const mockProfile = useMemo(() => getUserProfile(user), [user])
  const isPrivateClient = mockProfile?.role === 'private_client'
  const [realExpediente, setRealExpediente] = useState(null)

  useEffect(() => {
    if (!isPrivateClient) return
    let cancelled = false
    expedientesService
      .getAll({ limit: 1 })
      .then((res) => {
        const first = res.data[0]
        if (!first) return null
        return expedientesService.getById(first.id)
      })
      .then((full) => {
        if (!cancelled && full) setRealExpediente(full)
      })
      .catch(() => {
        // Sin expediente real disponible: se conserva el mock como fallback abajo.
      })
    return () => {
      cancelled = true
    }
  }, [isPrivateClient])

  const profile = isPrivateClient
    ? { ...mockProfile, expediente: realExpediente ?? mockProfile.expediente }
    : mockProfile
  const SidebarComponent = SIDEBARS[profile?.role]

  return (
    <LegalAgentProvider profile={profile} language={language} expedienteId={realExpediente?.id}>
      <div className="flex h-screen flex-col bg-background">
        <Header />

        <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:flex-row">
          <section className="animate-fade-in-up min-h-[50vh] flex-[2] md:min-h-0">
            <ChatBox
              role={profile?.role}
              userInitial={(profile?.nombre || profile?.role || '?').charAt(0).toUpperCase()}
              expedienteId={isPrivateClient ? realExpediente?.id : undefined}
            />
          </section>
          <aside className="animate-fade-in-up flex-1 md:max-w-sm" style={{ animationDelay: '100ms' }}>
            {SidebarComponent ? (
              <SidebarComponent profile={profile} />
            ) : (
              <div className="rounded-xl border border-border bg-white p-5 text-sm text-foreground/60">
                Rol no reconocido.
              </div>
            )}
          </aside>
        </main>

        <Footer />
      </div>
    </LegalAgentProvider>
  )
}

export default Dashboard
