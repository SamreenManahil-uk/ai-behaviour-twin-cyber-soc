import { MonitorCheck } from 'lucide-react'
import { endpointHealth } from '../../data/demoSocData'

export function EndpointHealth() {
  return (
    <article className="soc-panel p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="soc-label">EDR coverage</p>
          <h3 className="soc-value mt-2 text-lg">Endpoint health</h3>
        </div>
        <MonitorCheck className="text-brand-400" size={21} />
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div className="flex h-full w-full">
          {endpointHealth.map((item) => (
            <div
              key={item.label}
              className={item.colour}
              style={{ width: `${item.percentage}%` }}
              title={`${item.label}: ${item.percentage}%`}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {endpointHealth.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
              <span className={`h-2 w-2 rounded-full ${item.colour}`} />
              {item.label}
            </span>

            <span className="technical-value text-xs font-semibold">
              {item.value.toLocaleString()}
              <span className="ml-2 text-[var(--foreground-muted)]">
                {item.percentage}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}
