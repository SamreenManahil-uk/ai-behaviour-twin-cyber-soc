import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: DrawerProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close details drawer"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-[var(--border)] bg-[var(--background-elevated)] shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-[var(--border)] p-5 sm:p-6">
          <div>
            <p className="soc-label text-brand-400">Investigation details</p>
            <h2 id="drawer-title" className="soc-value mt-2 text-xl">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                {description}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={20} />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>

        {footer && (
          <footer className="flex flex-wrap justify-end gap-3 border-t border-[var(--border)] p-4 sm:px-6">
            {footer}
          </footer>
        )}
      </aside>
    </div>,
    document.body,
  )
}
