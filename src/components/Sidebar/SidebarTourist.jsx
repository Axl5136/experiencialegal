import { useState } from 'react'
import { PhoneIcon, ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../hooks/useLanguage'

function SidebarTourist({ profile }) {
  const [faqOpen, setFaqOpen] = useState(false)
  const { t } = useLanguage()
  const guideItems = t('sidebarTourist.guideItems')

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto rounded-xl border border-border bg-white p-5 shadow-[var(--shadow-elevation-md)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t('login.roles.tourist')}</p>
        <h2 className="mt-1 font-heading text-lg font-semibold text-foreground">{profile?.nombre}</h2>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-foreground/60">
          <GlobeAltIcon className="h-4 w-4" />
          {profile?.pais_origen}
        </div>
        <p className="mt-1 text-sm text-foreground/60">{profile?.dias_en_cdmx} días en CDMX</p>
      </div>

      <div className="rounded-lg bg-muted p-4">
        <h3 className="text-sm font-semibold text-foreground">{t('sidebarTourist.quickGuide')}</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-foreground/70">
          {Array.isArray(guideItems) &&
            guideItems.map((item, i) => (
              <li key={item} className="flex gap-2">
                <span className="text-accent">{i + 1}.</span>
                {item}
              </li>
            ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setFaqOpen((v) => !v)}
        className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary"
      >
        {t('sidebarTourist.faq')}
        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${faqOpen ? 'rotate-180' : ''}`} />
      </button>
      {faqOpen && (
        <p className="-mt-2 rounded-lg bg-muted px-4 py-3 text-sm text-foreground/60">
          {t('sidebarTourist.faqBody')}
        </p>
      )}

      <button
        type="button"
        className="mt-auto flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity duration-200 hover:opacity-90"
      >
        <PhoneIcon className="h-4 w-4" />
        {t('sidebarTourist.contactLawyer')}
      </button>
      <p className="text-center text-xs text-foreground/40">{t('sidebarTourist.available')}</p>
    </div>
  )
}

export default SidebarTourist
