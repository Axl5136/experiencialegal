import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { PaperClipIcon } from '@heroicons/react/24/outline'

function InputField({ value, onChange, onSend, placeholder, onAttach }) {
  const submit = () => {
    if (!value.trim()) return
    onSend(value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex items-center gap-2 border-t border-border bg-white p-4">
      {onAttach && (
        <button
          type="button"
          onClick={onAttach}
          aria-label="Adjuntar archivo"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-foreground/60 transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <PaperClipIcon className="h-5 w-5" />
        </button>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-11 flex-1 rounded-full border-2 border-border bg-muted px-4 py-2.5 text-base text-foreground placeholder:text-foreground/40 transition-colors duration-200 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
      <button
        type="button"
        onClick={submit}
        aria-label="Enviar"
        disabled={!value.trim()}
        className="group flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <PaperAirplaneIcon className="h-4 w-4 transition-transform duration-150 group-hover:rotate-45" />
      </button>
    </div>
  )
}

export default InputField
