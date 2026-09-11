import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
  badge?: ReactNode
  actions?: ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="soc-label text-brand-400">{eyebrow}</p>
          {badge}
        </div>
        <h2 className="soc-value mt-2 text-2xl sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground-secondary)]">
          {description}
        </p>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      )}
    </header>
  )
}
