import { useEffect, useRef } from 'react'
import { ScaleIcon } from '@heroicons/react/24/outline'
import ChatMessage from './ChatMessage'

const MAX_VISIBLE = 20

function MessageList({ messages, isTyping, userInitial, typingLabel = 'Escribiendo…' }) {
  const bottomRef = useRef(null)
  const visible = messages.slice(-MAX_VISIBLE)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="chat-scroll flex-1 space-y-4 overflow-y-auto px-4 py-4">
      {visible.map((message) => (
        <ChatMessage key={message.id} message={message} userInitial={userInitial} />
      ))}

      {isTyping && (
        <div className="animate-fade-in flex items-end gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <ScaleIcon className="animate-pulse-soft h-4 w-4 text-accent" />
          </div>
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border-l-4 border-accent bg-muted px-4 py-3">
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-foreground/40" style={{ animationDelay: '0ms' }} />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-foreground/40" style={{ animationDelay: '150ms' }} />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-foreground/40" style={{ animationDelay: '300ms' }} />
            <span className="sr-only">{typingLabel}</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList
