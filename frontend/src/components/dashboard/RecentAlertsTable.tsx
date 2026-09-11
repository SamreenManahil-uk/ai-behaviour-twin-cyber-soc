import { ArrowRight, ListFilter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { recentAlerts } from '../../data/demoSocData'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { SeverityBadge } from '../ui/SeverityBadge'

function statusVariant(status: string) {
  if (status === 'Resolved' || status === 'Contained') {
    return 'success' as const
  }

  if (status === 'Investigating') {
    return 'warning' as const
  }

  return 'info' as const
}

export function RecentAlertsTable() {
  return (
    <article className="soc-panel overflow-hidden">
      <header className="flex flex-col justify-between gap-4 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="soc-label">Priority queue</p>
          <h3 className="soc-value mt-2 text-lg">Recent security alerts</h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ListFilter size={15} />}
          >
            Filter
          </Button>
          <Link
            to="/alerts"
            className="inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-brand-400 hover:bg-brand-400/5"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50">
              {[
                'Alert',
                'Endpoint',
                'Severity',
                'Detection',
                'Status',
                'Risk',
                'Time',
              ].map((heading) => (
                <th
                  key={heading}
                  className="soc-label px-5 py-3.5 !text-[0.6rem]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {recentAlerts.map((alert) => (
              <tr
                key={alert.id}
                className="transition hover:bg-[var(--surface-hover)]/70"
              >
                <td className="px-5 py-4">
                  <p className="max-w-xs truncate text-sm font-semibold">
                    {alert.title}
                  </p>
                  <p className="technical-value mt-1 text-[0.625rem] text-[var(--foreground-muted)]">
                    {alert.id}
                  </p>
                </td>
                <td className="technical-value px-5 py-4 text-xs text-brand-400">
                  {alert.endpoint}
                </td>
                <td className="px-5 py-4">
                  <SeverityBadge severity={alert.severity} />
                </td>
                <td className="px-5 py-4 text-xs text-[var(--foreground-secondary)]">
                  {alert.source}
                </td>
                <td className="px-5 py-4">
                  <Badge variant={statusVariant(alert.status)} dot>
                    {alert.status}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-14 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <div
                        className={[
                          'h-full rounded-full',
                          alert.riskScore >= 90
                            ? 'bg-critical'
                            : alert.riskScore >= 75
                              ? 'bg-high'
                              : 'bg-medium',
                        ].join(' ')}
                        style={{ width: `${alert.riskScore}%` }}
                      />
                    </div>
                    <span className="technical-value text-xs font-semibold">
                      {alert.riskScore}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--foreground-muted)]">
                  {alert.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
