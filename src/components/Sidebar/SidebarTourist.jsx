import { useState } from 'react'
import { PhoneIcon, ChevronDownIcon, GlobeAltIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../hooks/useLanguage'
import Modal from '../Common/Modal'
import abogadosData from '../../data/abogados.json'

const FAQS = [
  {
    q: '¿Puedo estacionar en doble fila?',
    a: 'No, está prohibido en cualquier horario, excepto en zonas de carga/descarga entre 06:00-09:00 y 18:00-20:00. Multa: $1,200-$2,500 MXN + remolque.',
  },
  {
    q: '¿Qué hago si me piden coima?',
    a: 'No es obligatorio dar dinero a autoridades. Puedes negarte, es tu derecho. Reporta en Contraloría CDMX (55-5242-4500) o en la app "Denuncia Vial".',
  },
  {
    q: '¿Cuáles son los límites de velocidad?',
    a: 'Zona escolar 40 km/h, zona residencial 50 km/h, avenidas 60 km/h, periférico 80 km/h. Multa por exceso: $1,500-$3,000 MXN.',
  },
  {
    q: '¿Necesito verificación vehicular?',
    a: 'Si circulas con un auto propio en CDMX, sí. Sin verificación vigente la multa es de $2,500+ MXN.',
  },
  {
    q: '¿Cómo consulto si tengo multas?',
    a: 'Puedes verificar en el portal de la Secretaría de Movilidad de CDMX (semovi.cdmx.gob.mx) con tu número de placas.',
  },
]

function SidebarTourist({ profile }) {
  const [openFaqs, setOpenFaqs] = useState(new Set())
  const [contactOpen, setContactOpen] = useState(false)
  const { t } = useLanguage()
  const guideItems = t('sidebarTourist.guideItems')
  const abogado = abogadosData.abogados[0]

  const toggleFaq = (index) => {
    setOpenFaqs((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

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

      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">{t('sidebarTourist.faq')}</h3>
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqs.has(index)
            return (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted"
                >
                  {faq.q}
                  <ChevronDownIcon
                    className={`h-4 w-4 shrink-0 text-foreground/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p className="animate-fade-in-up bg-muted/60 px-3 pb-3 text-sm text-foreground/60">{faq.a}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setContactOpen(true)}
        className="mt-auto flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
      >
        <PhoneIcon className="h-4 w-4" />
        {t('sidebarTourist.contactLawyer')}
      </button>
      <p className="text-center text-xs text-foreground/40">{t('sidebarTourist.available')}</p>

      <Modal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        title={`Contactar: ${abogado.nombre}`}
        footer={
          <>
            <a
              href={`tel:${abogado.telefono.replace(/\s+/g, '')}`}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            >
              <PhoneIcon className="h-4 w-4" />
              Llamar
            </a>
            <a
              href={`mailto:${abogado.email}`}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary"
            >
              <EnvelopeIcon className="h-4 w-4" />
              Email
            </a>
            <button
              type="button"
              onClick={() => setContactOpen(false)}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-foreground/60 transition-colors duration-200 hover:text-foreground"
            >
              Cerrar
            </button>
          </>
        }
      >
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold text-foreground">Especialidad:</span>{' '}
            <span className="text-foreground/70">{abogado.especialidad}</span>
          </p>
          <p>
            <span className="font-semibold text-foreground">Teléfono:</span>{' '}
            <span className="text-foreground/70">{abogado.telefono}</span>
          </p>
          <p>
            <span className="font-semibold text-foreground">Email:</span>{' '}
            <span className="text-foreground/70">{abogado.email}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4 text-foreground/50" />
            <span className="text-foreground/70">{abogado.horario}</span>
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default SidebarTourist
