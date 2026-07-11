import { ChatBubbleOvalLeftEllipsisIcon, SparklesIcon } from '@heroicons/react/24/outline'

const TOPICS = {
  tourist: {
    es: [
      { label: 'Tránsito y multas', text: '¿Qué debo saber sobre tránsito y multas en CDMX?' },
      { label: 'Coimas y autoridades', text: '¿Qué hago si me piden coima?' },
      { label: 'Documentos y placas', text: '¿Qué documentos debo llevar siempre en el auto?' },
    ],
    en: [
      { label: 'Traffic & fines', text: 'What should I know about traffic and fines in CDMX?' },
      { label: 'Bribes & authorities', text: 'What do I do if they ask me for a bribe?' },
      { label: 'Documents & plates', text: 'What documents should I always carry in the car?' },
    ],
  },
  hotelier: {
    es: [
      { label: 'Permisos para negocio', text: '¿Qué permisos necesito para mi restaurante?' },
      { label: 'Inspecciones de Salubridad', text: '¿Qué inspecciona Salubridad?' },
      { label: 'Protocolos de seguridad', text: '¿Qué necesito para protección civil?' },
    ],
    en: [
      { label: 'Business permits', text: 'What permits do I need for my restaurant?' },
      { label: 'Health inspections', text: 'What does the Health authority inspect?' },
      { label: 'Safety protocols', text: 'What do I need for civil protection?' },
    ],
  },
  private_client: {
    es: [
      { label: 'Estado de mi caso', text: '¿En qué etapa está mi caso?' },
      { label: 'Próxima audiencia', text: '¿Cuándo es mi próxima audiencia?' },
      { label: 'Mis documentos', text: '¿Qué documentos tiene mi expediente?' },
    ],
    en: [
      { label: 'Case status', text: 'What stage is my case in?' },
      { label: 'Next hearing', text: 'When is my next hearing?' },
      { label: 'My documents', text: 'What documents does my case file have?' },
    ],
  },
}

function ChatEmptyState({ role, language, onSelectTopic }) {
  const topics = TOPICS[role]?.[language] ?? TOPICS.tourist.es
  const copy =
    language === 'en'
      ? { title: 'What would you like to know today?', subtitle: 'Ask a question, pick a topic, or…' }
      : { title: '¿Qué te gustaría saber hoy?', subtitle: 'Haz una pregunta, elige un tema o…' }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <ChatBubbleOvalLeftEllipsisIcon className="h-16 w-16 text-border" aria-hidden="true" />
      <div>
        <p className="font-heading text-lg font-semibold text-foreground">{copy.title}</p>
        <p className="mt-1 text-sm text-foreground/50">{copy.subtitle}</p>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {topics.map((topic) => (
          <button
            key={topic.label}
            type="button"
            onClick={() => onSelectTopic(topic.text)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-foreground/70 transition-colors duration-150 hover:border-accent hover:bg-accent/10 hover:text-accent"
          >
            <SparklesIcon className="h-3.5 w-3.5" />
            {topic.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChatEmptyState
