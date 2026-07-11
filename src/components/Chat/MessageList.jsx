import { useEffect, useRef } from 'react'

const MAX_VISIBLE = 20

function MessageList({ messages, isTyping }) {
  const bottomRef = useRef(null)
  const visible = messages.slice(-MAX_VISIBLE)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      {visible.map((message) => (
        <div
          key={message.id}
          className={`animate-fade-in-up flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm shadow-[var(--shadow-elevation-sm)] ${
              message.sender === 'user'
                ? 'rounded-br-sm bg-primary text-primary-foreground'
                : 'rounded-bl-sm bg-muted text-foreground'
            }`}
          >
            {message.text}
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="animate-fade-in flex justify-start">
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-foreground/40" style={{ animationDelay: '0ms' }} />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-foreground/40" style={{ animationDelay: '150ms' }} />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-foreground/40" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList
