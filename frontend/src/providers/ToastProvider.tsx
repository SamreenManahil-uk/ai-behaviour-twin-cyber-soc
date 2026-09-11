import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react'
import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ToastContext,
  type ToastInput,
  type ToastVariant,
} from '../contexts/toast-context'

interface ToastProviderProps {
  children: ReactNode
}

interface ToastItem extends ToastInput {
  id: number
  variant: ToastVariant
}

const icons = {
  success: CircleCheck,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
}

const colours = {
  success: 'text-healthy bg-emerald-400/10 border-emerald-400/20',
  error: 'text-critical bg-rose-400/10 border-rose-400/20',
  warning: 'text-medium bg-amber-400/10 border-amber-400/20',
  info: 'text-low bg-sky-400/10 border-sky-400/20',
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (input: ToastInput) => {
      const id = Date.now() + Math.floor(Math.random() * 1000)
      const toast: ToastItem = {
        ...input,
        id,
        variant: input.variant ?? 'info',
      }

      setToasts((current) => [...current.slice(-3), toast])

      window.setTimeout(() => {
        removeToast(id)
      }, 4500)
    },
    [removeToast],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="fixed right-4 top-4 z-[150] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => {
          const Icon = icons[toast.variant]

          return (
            <article
              key={toast.id}
              className="soc-panel flex items-start gap-3 p-4"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${colours[toast.variant]}`}
              >
                <Icon size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-lg p-1 text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </article>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
