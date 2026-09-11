import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type BadgeVariant =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'purple'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
  children: ReactNode
}

const variants: Record<BadgeVariant, string> = {
  neutral:
    'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground-secondary)]',
  info: 'border-sky-400/20 bg-sky-400/10 text-sky-400',
  success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400',
  warning: 'border-amber-400/20 bg-amber-400/10 text-amber-400',
  danger: 'border-rose-400/20 bg-rose-400/10 text-rose-400',
  purple: 'border-violet-400/20 bg-violet-400/10 text-violet-400',
}

const dotColours: Record<BadgeVariant, string> = {
  neutral: 'bg-[var(--foreground-muted)]',
  info: 'bg-sky-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  purple: 'bg-violet-400',
}

export function Badge({
  variant = 'neutral',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'text-[0.6875rem] font-semibold leading-none',
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', dotColours[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
