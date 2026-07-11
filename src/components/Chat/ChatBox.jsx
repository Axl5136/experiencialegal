import { useState } from 'react'
import { ScaleIcon } from '@heroicons/react/24/outline'
import { useLegalAgent } from '../../hooks/useLegalAgent'
import { useLanguage } from '../../hooks/useLanguage'
import MessageList from './MessageList'
import InputField from './InputField'
import ChatEmptyState from './ChatEmptyState'

function ChatBox({ role, userInitial }) {
  const { conversation, sendMessage, isTyping, hasPriorHistory } = useLegalAgent()
  const { t, language } = useLanguage()
  const [inputValue, setInputValue] = useState('')

  const handleSend = (text) => {
    sendMessage(text)
    setInputValue('')
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-white shadow-[var(--shadow-elevation-md)]">
      <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-border bg-white/90 px-4 py-3 shadow-[var(--shadow-elevation-sm)] backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <ScaleIcon className="animate-pulse-soft h-5 w-5 text-accent" aria-hidden="true" />
          <span className="font-heading text-sm font-semibold text-primary">
            {language === 'en' ? 'Legal Assistant 24/7' : 'Asistente Legal 24/7'}
          </span>
        </div>
        {hasPriorHistory && conversation.length > 0 && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-foreground/50">
            {language === 'en' ? 'Previous chat' : 'Chat anterior'}
          </span>
        )}
      </div>

      {conversation.length === 0 ? (
        <ChatEmptyState role={role} language={language} onSelectTopic={setInputValue} />
      ) : (
        <MessageList
          messages={conversation}
          isTyping={isTyping}
          userInitial={userInitial}
          typingLabel={t('dashboard.typing')}
        />
      )}

      <InputField
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        placeholder={t('dashboard.chatPlaceholder')}
      />
    </div>
  )
}

export default ChatBox
