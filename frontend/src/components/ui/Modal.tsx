import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`soc-panel relative z-10 max-h-[90vh] w-full overflow-hidden ${sizes[size]}`}
      >
        <header className="flex items-start justify-between border-b border-[var(--border)] p-5 sm:p-6">
          <div>
            <h2 id="modal-title" className="soc-value text-lg">
              {title}
            </h2>
            {description && (
              <p className="mt-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                {description}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-2"
          >
            <X size={19} />
          </Button>
        </header>

        <div className="max-h-[60vh] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>

        {footer && (
          <footer className="flex flex-wrap justify-end gap-3 border-t border-[var(--border)] p-4 sm:px-6">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body,
  )
}
