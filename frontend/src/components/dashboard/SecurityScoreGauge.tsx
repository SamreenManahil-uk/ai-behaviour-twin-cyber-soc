import { ShieldCheck } from 'lucide-react'

interface SecurityScoreGaugeProps {
  score: number
}

export function SecurityScoreGauge({ score }: SecurityScoreGaugeProps) {
  const safeScore = Math.min(100, Math.max(0, score))

  return (
    <article className="soc-panel relative overflow-hidden p-5 sm:p-6">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/8 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="soc-label">Security posture</p>
          <h3 className="soc-value mt-2 text-lg">Organisation score</h3>
        </div>
        <ShieldCheck className="text-healthy" size={22} />
      </div>

      <div className="relative mt-7 flex items-center justify-center">
        <div
          className="relative flex h-44 w-44 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#34d399 ${safeScore * 3.6}deg, var(--surface-muted) 0deg)`,
          }}
          role="img"
          aria-label={`Security score ${safeScore} out of 100`}
        >
          <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-[var(--background-elevated)] shadow-inner">
            <span className="technical-value text-4xl font-bold">
              {safeScore}
            </span>
            <span className="mt-1 text-xs text-[var(--foreground-muted)]">
              out of 100
            </span>
            <span className="mt-3 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-healthy">
              Strong
            </span>
          </div>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-2 text-center">
        {[
          ['Controls', '96%'],
          ['Coverage', '93%'],
          ['Response', '87%'],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl bg-[var(--surface-muted)] px-2 py-3"
          >
            <p className="technical-value text-sm font-bold">{value}</p>
            <p className="mt-1 text-[0.625rem] text-[var(--foreground-muted)]">
              {label}
            </p>
          </div>
        ))}
      </div>
    </article>
  )
}
