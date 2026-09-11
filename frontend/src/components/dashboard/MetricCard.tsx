import {
  ArrowDownRight,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  detail: string
  trend: number
  icon: LucideIcon
  iconColour: string
  featured?: boolean
}

export function MetricCard({
  label,
  value,
  detail,
  trend,
  icon: Icon,
  iconColour,
  featured = false,
}: MetricCardProps) {
  const positive = trend >= 0
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight

  return (
    <article
      className={[
        'soc-panel-interactive relative overflow-hidden p-5',
        featured ? 'border-brand-400/20' : '',
      ].join(' ')}
    >
      {featured && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
      )}

      <div className="mb-5 flex items-start justify-between">
        <span className="soc-label">{label}</span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-muted)] ${iconColour}`}
        >
          <Icon size={19} />
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <p className="soc-value technical-value text-3xl">{value}</p>

        <span
          className={[
            'flex items-center gap-0.5 rounded-full px-2 py-1',
            'technical-value text-[0.65rem] font-semibold',
            positive
              ? 'bg-emerald-400/10 text-healthy'
              : 'bg-rose-400/10 text-critical',
          ].join(' ')}
        >
          <TrendIcon size={12} />
          {Math.abs(trend)}%
        </span>
      </div>

      <p className="mt-2 text-xs text-[var(--foreground-muted)]">{detail}</p>
    </article>
  )
}
