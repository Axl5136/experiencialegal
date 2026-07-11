import { useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { getUserProfile } from '../utils/getUserProfile'
import { LegalAgentProvider } from '../context/LegalAgentContext'
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
  const profile = useMemo(() => getUserProfile(user), [user])
  const SidebarComponent = SIDEBARS[profile?.role]

  return (
    <LegalAgentProvider profile={profile} language={language}>
      <div className="flex h-screen flex-col bg-background">
        <Header />

        <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:flex-row">
          <section className="min-h-[50vh] flex-[2] md:min-h-0">
            <ChatBox />
          </section>
          <aside className="flex-1 md:max-w-sm">
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
