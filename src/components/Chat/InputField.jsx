import { useState } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

function InputField({ onSend, placeholder }) {
  const [value, setValue] = useState('')

  const submit = () => {
    if (!value.trim()) return
    onSend(value)
    setValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex items-center gap-2 border-t border-border bg-white p-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="button"
        onClick={submit}
        aria-label="Enviar"
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground transition-all duration-200 hover:scale-105 hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        disabled={!value.trim()}
      >
        <PaperAirplaneIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

export default InputField
