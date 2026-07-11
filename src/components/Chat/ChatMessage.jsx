import { useState } from 'react'
import { ClipboardDocumentIcon, CheckIcon, ScaleIcon } from '@heroicons/react/24/outline'

function formatTime(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ChatMessage({ message, userInitial }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.sender === 'user'
  const time = formatTime(message.timestamp)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  if (isUser) {
    return (
      <div className="animate-fade-in-up flex items-end justify-end gap-2">
        <div className="flex flex-col items-end">
          <div className="max-w-[80%] whitespace-pre-line rounded-2xl bg-gradient-to-br from-accent to-primary px-4 py-3 text-sm text-white shadow-[var(--shadow-elevation-sm)]">
            {message.text}
          </div>
          {time && <span className="mr-1 mt-1 text-[10px] text-primary-light">{time}</span>}
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
          {userInitial}
        </div>
      </div>
    )
  }

  return (
    <div className="group animate-fade-in-up flex items-end gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <ScaleIcon className="animate-pulse-soft h-4 w-4 text-accent" />
      </div>
      <div className="flex flex-col items-start">
        <div className="relative max-w-[85%] whitespace-pre-line rounded-2xl border-l-4 border-accent bg-gradient-to-br from-muted to-white px-4 py-3 text-sm text-foreground shadow-[var(--shadow-elevation-sm)]">
          {message.text}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copiar"
            className="absolute -right-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border bg-white opacity-0 shadow-[var(--shadow-elevation-sm)] transition-opacity duration-150 group-hover:opacity-100"
          >
            {copied ? (
              <CheckIcon className="h-3.5 w-3.5 text-success" />
            ) : (
              <ClipboardDocumentIcon className="h-3.5 w-3.5 text-foreground/50" />
            )}
          </button>
        </div>
        {time && <span className="ml-1 mt-1 text-[10px] text-foreground/40">{time}</span>}
      </div>
    </div>
  )
}

export default ChatMessage
