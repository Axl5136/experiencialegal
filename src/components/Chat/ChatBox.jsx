import { useLegalAgent } from '../../hooks/useLegalAgent'
import { useLanguage } from '../../hooks/useLanguage'
import MessageList from './MessageList'
import InputField from './InputField'

function ChatBox() {
  const { conversation, sendMessage, isTyping } = useLegalAgent()
  const { t } = useLanguage()

  const messages =
    conversation.length > 0
      ? conversation
      : [{ id: 'welcome', sender: 'bot', text: t('dashboard.welcome'), timestamp: '' }]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-elevation-md)]">
      <MessageList messages={messages} isTyping={isTyping} />
      <InputField onSend={sendMessage} placeholder={t('dashboard.chatPlaceholder')} />
    </div>
  )
}

export default ChatBox
