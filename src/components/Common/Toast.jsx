import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'

const STYLES = {
  success: { Icon: CheckCircleIcon, iconClass: 'text-success' },
  error: { Icon: XCircleIcon, iconClass: 'text-destructive' },
  info: { Icon: InformationCircleIcon, iconClass: 'text-primary' },
}

function Toast({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed right-4 top-4 z-[100] flex w-full max-w-xs flex-col gap-2">
      {toasts.map((toast) => {
        const { Icon, iconClass } = STYLES[toast.type] ?? STYLES.success
        return (
          <div
            key={toast.id}
            className="animate-fade-in-up flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-3 shadow-[var(--shadow-elevation-lg)]"
          >
            <Icon className={`h-5 w-5 shrink-0 ${iconClass}`} aria-hidden="true" />
            <span className="flex-1 text-sm text-foreground">{toast.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Cerrar"
              className="cursor-pointer text-foreground/30 transition-colors duration-150 hover:text-foreground/60"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default Toast
