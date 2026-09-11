import {
  ArrowDownAZ,
  FilterX,
  SearchX,
  ShieldAlert,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { AlertDetailsDrawer } from '../components/alerts/AlertDetailsDrawer'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { SearchInput } from '../components/ui/SearchInput'
import { Select } from '../components/ui/Select'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import {
  demoAlerts,
  type DemoAlert,
} from '../data/demoEventsAlerts'

const pageSize = 5

function statusVariant(status: DemoAlert['status']) {
  if (status === 'Contained' || status === 'Resolved') {
    return 'success' as const
  }

  if (status === 'Investigating') {
    return 'warning' as const
  }

  if (status === 'False Positive') {
    return 'neutral' as const
  }

  return 'danger' as const
}

export function AlertsPage() {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('All')
  const [status, setStatus] = useState('All')
  const [source, setSource] = useState('All')
  const [sort, setSort] = useState('risk-desc')
  const [page, setPage] = useState(1)
  const [selectedAlert, setSelectedAlert] = useState<DemoAlert | null>(null)

  const filteredAlerts = useMemo(() => {
    const term = search.trim().toLowerCase()

    const result = demoAlerts.filter((alert) => {
      const matchesSearch =
        !term ||
        [
          alert.id,
          alert.title,
          alert.endpoint,
          alert.user,
          alert.process,
          alert.destinationIp,
          alert.mitreId,
          alert.mitreName,
        ].some((value) => value.toLowerCase().includes(term))

      return (
        matchesSearch &&
        (severity === 'All' || alert.severity === severity) &&
        (status === 'All' || alert.status === status) &&
        (source === 'All' || alert.detectionSource === source)
      )
    })

    return [...result].sort((first, second) => {
      if (sort === 'risk-asc') {
        return first.riskScore - second.riskScore
      }

      if (sort === 'title') {
        return first.title.localeCompare(second.title)
      }

      return second.riskScore - first.riskScore
    })
  }, [search, severity, status, source, sort])

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visibleAlerts = filteredAlerts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  function resetPage() {
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setSeverity('All')
    setStatus('All')
    setSource('All')
    setSort('risk-desc')
    setPage(1)
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Detection and triage"
        title="Threat Alerts"
        description="Prioritise explainable XGBoost, anomaly, Behaviour Twin, rule and hybrid detections."
        badge={<Badge variant="purple">Demo alerts</Badge>}
        actions={
          <Button variant="outline" leftIcon={<ShieldAlert size={16} />}>
            Export queue
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Open alerts', '266', 'text-brand-400'],
          ['Critical', '12', 'text-critical'],
          ['Investigating', '38', 'text-medium'],
          ['Contained today', '24', 'text-healthy'],
        ].map(([label, value, colour]) => (
          <article key={label} className="soc-panel p-4">
            <p className="soc-label">{label}</p>
            <p className={`technical-value mt-3 text-2xl font-bold ${colour}`}>
              {value}
            </p>
          </article>
        ))}
      </div>

      <article className="soc-panel overflow-hidden">
        <div className="border-b border-[var(--border)] p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(18rem,1fr)_auto_auto_auto_auto_auto]">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value)
                resetPage()
              }}
              placeholder="Search alert, endpoint, IP or MITRE..."
              label="Search threat alerts"
            />

            <Select
              label="Filter severity"
              value={severity}
              onChange={(event) => {
                setSeverity(event.target.value)
                resetPage()
              }}
              options={[
                { label: 'All severities', value: 'All' },
                { label: 'Critical', value: 'Critical' },
                { label: 'High', value: 'High' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Low', value: 'Low' },
              ]}
            />

            <Select
              label="Filter status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value)
                resetPage()
              }}
              options={[
                { label: 'All statuses', value: 'All' },
                { label: 'New', value: 'New' },
                { label: 'Investigating', value: 'Investigating' },
                { label: 'Contained', value: 'Contained' },
                { label: 'Resolved', value: 'Resolved' },
                { label: 'False Positive', value: 'False Positive' },
              ]}
            />

            <Select
              label="Filter detection source"
              value={source}
              onChange={(event) => {
                setSource(event.target.value)
                resetPage()
              }}
              options={[
                { label: 'All detections', value: 'All' },
                { label: 'Hybrid', value: 'Hybrid' },
                { label: 'XGBoost', value: 'XGBoost' },
                { label: 'Isolation Forest', value: 'Isolation Forest' },
                { label: 'Behaviour Twin', value: 'Behaviour Twin' },
                { label: 'Rule', value: 'Rule' },
              ]}
            />

            <Select
              label="Sort alerts"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              options={[
                { label: 'Risk: highest', value: 'risk-desc' },
                { label: 'Risk: lowest', value: 'risk-asc' },
                { label: 'Title A–Z', value: 'title' },
              ]}
            />

            <Button
              variant="outline"
              leftIcon={<FilterX size={16} />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--foreground-muted)]">
              {filteredAlerts.length} alerts match the current filters
            </p>
            <span className="flex items-center gap-1 text-[0.6875rem] text-[var(--foreground-muted)]">
              <ArrowDownAZ size={13} />
              Deterministic sorting
            </span>
          </div>
        </div>

        {visibleAlerts.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No alerts found"
              description="No threat alerts match the selected filters."
              icon={SearchX}
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50">
                    {[
                      'Alert',
                      'Endpoint',
                      'Severity',
                      'Detection',
                      'MITRE',
                      'Status',
                      'Risk',
                      'Timestamp',
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
                  {visibleAlerts.map((alert) => (
                    <tr
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className="cursor-pointer transition hover:bg-[var(--surface-hover)]/70"
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
                      <td className="px-5 py-4">
                        <Badge variant="purple">
                          {alert.detectionSource}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <p className="technical-value text-xs font-semibold">
                          {alert.mitreId}
                        </p>
                        <p className="mt-1 max-w-36 truncate text-[0.625rem] text-[var(--foreground-muted)]">
                          {alert.mitreName}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={statusVariant(alert.status)} dot>
                          {alert.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--surface-muted)]">
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
                          <span className="technical-value text-xs font-bold">
                            {alert.riskScore}
                          </span>
                        </div>
                      </td>
                      <td className="technical-value whitespace-nowrap px-5 py-4 text-xs text-[var(--foreground-muted)]">
                        {alert.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={safePage}
              pageSize={pageSize}
              totalItems={filteredAlerts.length}
              onPageChange={setPage}
            />
          </>
        )}
      </article>

      <AlertDetailsDrawer
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />

      <p className="text-center text-[0.6875rem] text-[var(--foreground-muted)]">
        Alert records and response buttons are fictional demonstrations. No
        real endpoint action is performed.
      </p>
    </section>
  )
}
