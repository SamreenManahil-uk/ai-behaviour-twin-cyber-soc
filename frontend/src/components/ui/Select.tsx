import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
}

export function Select({
  label,
  options,
  className,
  ...props
}: SelectProps) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        className={cn(
          'h-11 min-w-36 appearance-none rounded-xl border border-[var(--border)]',
          'bg-[var(--surface)] py-0 pl-3 pr-9 text-sm text-[var(--foreground-secondary)]',
          'outline-none transition focus:border-brand-400/50',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
      />
    </label>
  )
}
