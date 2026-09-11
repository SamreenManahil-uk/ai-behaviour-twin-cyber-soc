import { LoaderCircle } from 'lucide-react'
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'outline'

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-400 text-slate-950 hover:bg-brand-300 shadow-[0_0_28px_rgba(34,211,238,0.12)]',
  secondary:
    'bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]',
  ghost:
    'bg-transparent text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]',
  danger:
    'bg-critical text-white hover:bg-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.12)]',
  outline:
    'border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-secondary)] hover:border-brand-400/40 hover:text-brand-400',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-sm',
  icon: 'h-11 w-11 p-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold',
          'transition-all duration-200 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:translate-y-px',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <LoaderCircle
            size={17}
            className="animate-spin"
            aria-hidden="true"
          />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    )
  },
)
